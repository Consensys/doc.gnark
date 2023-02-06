---
title: EdDSA
description: How to check an EdDSA signature inside a zkSNARK circuit
sidebar_position: 1
---

# EdDSA

This tutorial walks through the implementation of a circuit asserting that an [EdDSA signature](https://en.wikipedia.org/wiki/EdDSA) is correct.

If you are interested in how to use EdDSA in a zk-SNARK, refer to [Test the circuit](#test-the-circuit).

:::note EdDSA in a zk-SNARK is of particular interest for zk-Rollups

A zk-Rollup operator batch processes many signed transactions from its users, and updates their state accordingly.

zk-Rollup operator creates a zk-SNARK proof attesting all the transactions are valid, and must verify that the signatures are correct inside a zk-SNARK circuit.

:::

## Write the circuit

:::info

The EdDSA signature scheme does not use standard curves such as ed1559. In a zk-SNARK circuit, variables live in $\mathbb{F}_r$, which is different from the ed1559's field of definition. This is further explained in the [Circuit section](../Concepts/circuits.md).

To settle this issue, special twisted Edwards curves have been created which are defined on $\mathbb{F}_r$. They have been called [JubJub](https://z.cash/technology/jubjub/) for _BLS12_381_ companion curves, and [Baby JubJub](https://github.com/ethereum/EIPs/pull/2494) for _BN254_ companion curves.

In [`gnark-crypto`](https://github.com/consensys/gnark-crypto), they are defined under `gnark-crypto/ecc/bn254{bls12381,...}/twistededwards`.

:::

The EdDSA workflow is as follows:

1. Sign a message, this happens outside of the zk-SNARK circuit:

   ```go
   privateKey, publicKey := eddsa.New(..)
   signature := privateKey.Sign(message)
   ```

1. Verify the EdDSA signature inside the zk-SNARK circuit:

   ```go
   assert(isValid(signature, message, publicKey))
   ```

### Witness and data structures

What variables are needed (the witness) to verify the EdDSA signature?

1.  The signer's public key

    The public key is a point on the twisted Edward curve, so a tuple $(x,y)$. We also need to store the parameters of the twisted Edwards curve in the public key, so that when accessing a public key you can access to the corresponding curve.

    Let's create the `struct` containing the twisted Edwards curve parameter:

    ```go
    // CurveParams twisted edwards curve parameters ax^2 + y^2 = 1 + d*x^2*y^2
    // Matches gnark-crypto curve specific params
    type CurveParams struct {
        A, D, Cofactor, Order *big.Int
        Base                  [2]*big.Int // base point coordinates
    }
    ```

    :::note

    `gnark` supports different curves and provides an ID to specify the curve to use.

    :::

    Now you can define the `struct` storing the public key:

    ```go
    package eddsa

    import "github.com/consensys/gnark/std/algebra/twistededwards"

    type PublicKey struct {
        A     twistededwards.Point
    }
    ```

    :::note

    The package `twistededwards` defines `twistededwards.Point` as a tuple $(x,y)$ of `frontend.Variable`.

    This structure has the associated methods to the elliptic curve group structure, like scalar multiplication.

    :::

1.  The signature

    An EdDSA signature of a message (which we assume is already hashed) is a tuple $(R,S)$ where $R$ is a point $(x,y)$ on the twisted Edwards curve, and $S$ is a scalar. The scalar $S$ is used to perform a scalar multiplication on the twisted Edwards curve.

    Now you can define the structure for storing a signature:

    ```go
    import "github.com/consensys/gnark/frontend"

    // Signature stores a signature  (to be used in gnark circuit)
    // An EdDSA signature is a tuple (R,S) where R is a point on the twisted Edwards curve
    // and S a scalar. Since the base field of the twisted Edwards is Fr, the number of points
    // N on the Edwards is < r+1+2sqrt(r)+2 (since the curve has 2 points of multiplicity 2).
    // The subgroup l used in eddsa is <1/2N, so the reduction
    // mod l ensures S < r, therefore there is no risk of overflow.
    type Signature struct {
        R twistededwards.Point
        S frontend.Variable
    }
    ```

### Circuit definition

Now that the `Signature` and `PublicKey` structures are created, you can write the core of the EdDSA verification algorithm.

Let's recall the operations of the signature verification. Let $G$ be the base point of the twisted Edward curve, that is the point such that $[k]G=A$, where $k$ is the secret key of the signer, and $A$ its public key. Given a message $M$, a signature $(R,S)$, a public key $A$, and a hash function $H$ (the same that has been used for signing), the verifier must check that the following relation holds:

$$
[2^c*S]G = [2^c]R +[2^cH(R,A,M)]A
$$

:::info

$c$ is either $2$ or $3$, depending on the twisted Edwards curve.

:::

First, define the signature of the `Verify` function. This function needs a signature, a message and a public key. It also needs a `frontend.ConstraintSystem` object, on which the functions from the [gnark API](../HowTo/write/circuit_api.md) are called.

```go
func Verify(api frontend.API, sig Signature, msg frontend.Variable, pubKey PublicKey) error {
    // ...
}
```

The first operation is to compute $H(R,A,M)$. The hash function is not given as parameters here, because only a specific snark-friendly hash function can be used, you therefore hard code the use of the `mimc` hash function:

```go
import (
    "github.com/consensys/gnark/frontend"
    "github.com/consensys/gnark/std/algebra/twistededwards"
    "github.com/consensys/gnark/std/hash/mimc"
)

func Verify(curve twistededwards.Curve, sig Signature, msg frontend.Variable, pubKey PublicKey, hash hash.Hash) error {

    // compute H(R, A, M)
    data := []frontend.Variable{
        sig.R.A.X,
        sig.R.A.Y,
        pubKey.A.X,
        pubKey.A.Y,
        msg,
    }
    hramConstant := hash.Hash(cs, data...)

    return nil
}
```

Next you compute the left-hand side of the equality, that is $[2^c*S]G$:

```go
    // [2^basis*S1]G
    lhs.ScalarMulFixedBase(cs, pubKey.Curve.BaseX, pubKey.Curve.BaseY, sig.S1, pubKey.Curve).
        ScalarMulNonFixedBase(cs, &lhs, basis, pubKey.Curve)

    // [S2]G
    tmp := twistededwards.Point{}
    tmp.ScalarMulFixedBase(cs, pubKey.Curve.BaseX, pubKey.Curve.BaseY, sig.S2, pubKey.Curve)

    // [2^basis*S1 + S2]G
    lhs.AddGeneric(cs, &lhs, &tmp, pubKey.Curve)

    // [2^c*(2^basis*S1 + S2)]G
    lhs.ScalarMulNonFixedBase(cs, &lhs, cofactorConstant, pubKey.Curve)

    lhs.MustBeOnCurve(cs, pubKey.Curve)
```

:::note

Notice the use of `ScalarMulFixedBase` when the point coordinates are in `big.Int`, and `ScalarMulNonFixedBase` when the point coordinates are in `frontend.Variable`. The former costs less constraints, so it should be used whenever the coordinates of the point to multiply are not of type `frontend.Variable`.

:::

Next, continue the implementation with the computation of the right-hand side:

```go
    //rhs = [2^c]R+[2^cH(R,A,M)]A
    // M: message
    // A: public key
    // R: from the signature (R,S)
    rhs := twistededwards.Point{}
    rhs.ScalarMulNonFixedBase(cs, &pubKey.A, hramConstant, pubKey.Curve).
        AddGeneric(cs, &rhs, &sig.R.A, pubKey.Curve).
        ScalarMulNonFixedBase(cs, &rhs, cofactorConstant, pubKey.Curve)
    rhs.MustBeOnCurve(cs, pubKey.Curve)
```

:::tip Debugging

You can print values using `api.Println` that behaves like `fmt.Println`, except it will output the values at proving time (when they are solved).

```go
api.Println("A.X", pubKey.A.X)
```

:::

Until now, you have only used objects which are defined in the `gnark` standard library, for example, the `twistededwards` library and the `mimc` library. For all the methods that you used, you passed the `cs` parameter, of type `*frontend.ConstraintSystem`, which contains the description of the constraint system. However, you never actually used the [gnark API](../HowTo/write/circuit_api.md).

Use the gnark API, to assert that the left-hand side is equal to the right-hand side:

```go
    // ensures that lhs==rhs
    api.AssertIsEqual(lhs.X, rhs.X)
    api.AssertIsEqual(lhs.Y, rhs.Y)
```

:::info

Currently, `AssertIsEqual` doesn't work on arbitrary structure.

Therefore to enforce equality between the left-hand side (lhs) and the right-hand side (rhs), you must use `AssertIsEqual` on the X and Y part of the `lhs` and the `rhs` individually.

:::

## Test the circuit

You successfully implemented EdDSA in a zkSNARK, next you need to test it.

You need a structure implementing a `Define` function as described in [the circuit structure page](../HowTo/write/circuit_structure.md). The structure should contain the witnesses as `frontend.Variable` that are needed for an EdDSA signature verification. You need a public key, a signature $(R,S)$, and a message:

```go
import (
    "github.com/consensys/gnark/frontend"
    "github.com/consensys/gnark/std/signature/eddsa"
)

type eddsaCircuit struct {
    PublicKey eddsa.PublicKey   `gnark:",public"`
    Signature eddsa.Signature   `gnark:",public"`
    Message   frontend.Variable `gnark:",public"`
}
```

Notice that all the witnesses are public.

You need a `Define` function describing the mathematical statement that must be verified. You did most of this job with the `Verify` implementation, now you have to assemble the parts.

```go
import (
    "github.com/consensys/gnark/std/algebra/twistededwards"
    "github.com/consensys/gnark-crypto/ecc"
)

func (circuit *eddsaCircuit) Define(api frontend.API) error {
    curve, err := twistededwards.NewEdCurve(api, circuit.curveID)
    if err != nil {
        return err
    }

    mimc, err := mimc.NewMiMC(api)
    if err != nil {
        return err
    }

    // verify the signature in the cs
    return eddsa.Verify(curve, circuit.Signature, circuit.Message, circuit.PublicKey, &mimc)

    return nil
}
```

To test the circuit, you need to generate an EdDSA signature, assign the signature on the circuit's witnesses, and verify that the circuit has been correctly solved.

To generate the signature, use the `github.com/consensys/gnark-crypto/signature/eddsa` package.

Implementations of EdDSA exist for several curves, here you will choose BN254.

```go
func main() {
    // instantiate hash function
    hFunc := hash.MIMC_BN254.New()

    // create a eddsa key pair
    privateKey, err := eddsa.New(twistededwards.BN254, crand.Reader)
    publicKey := privateKey.Public()

    // note that the message is on 4 bytes
    msg := []byte{0xde, 0xad, 0xf0, 0x0d}

    // sign the message
    signature, err := privateKey.Sign(msg, hFunc)

    // verifies signature
    isValid, err := publicKey.Verify(signature, msg, hFunc)
    if !isValid {
        fmt.Println("1. invalid signature")
    } else {
        fmt.Println("1. valid signature")
    }
}
```

Compile the circuit:

```go
    var circuit eddsaCircuit
    r1cs, err := frontend.Compile(ecc.BN254, r1cs.NewBuilder, &circuit)
```

:::note

`r1cs` is the arithmetized version of the circuit.

It is a list of constraints that the prover needs to fulfill by providing satisfying inputs, namely a correct signature on a message.

:::

Run the Groth16 setup to get the `ProvingKey` and `VerifyingKey` linked to the circuit.

```go
    // generating pk, vk
    pk, vk, err := groth16.Setup(r1cs)
```

Create the witness (the data needed to verify a signature inside the zk-SNARK), from the previously computed `signature`.

```go
    // declare the witness
    var assignment eddsaCircuit

    // assign message value
    assignment.Message = msg

    // public key bytes
    _publicKey := publicKey.Bytes()

    // assign public key values
    assignment.PublicKey.Assign(ecc.BN254, _publicKey[:32])

    // assign signature values
    assignment.Signature.Assign(ecc.BN254, signature)
```

Last step is to generate the proof and verify it.

```go
    // witness
    witness, err := frontend.NewWitness(&assignment, ecc.BN254)
    publicWitness, err := witness.Public()
    // generate the proof
    proof, err := groth16.Prove(r1cs, pk, witness)

    // verify the proof
    err = groth16.Verify(proof, vk, publicWitness)
    if err != nil {
        // invalid proof
    }
```

:::tip Unit tests

In a `_test.go` file, you can use `gnark/backend/groth16/assert.go` as follows:

```go
assert := groth16.NewAssert(t)
var witness Circuit
assert.ProverFailed(&circuit, &assignment) // .ProverSucceeded
```

:::
