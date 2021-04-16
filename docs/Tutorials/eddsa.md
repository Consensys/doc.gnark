---
description: How to write a ZK-Rollup operator circuit with gnark
--- 

---
# EdDSA

This tutorial walks through the implementation of a circuit asserting that an EdDSA signature is correct.

Such a circuit is important for a zk-rollup. In a zk-rollup, an operator receives signed transactions from users, and update its state accordingly. Once sufficiently many transactions have been received, the operator creates a zk-SNARK proof proving all the transactions are valid, and that the state updates have been done correctly. In particular, the circuit representing the batch of all the transactions must assert the signatures are correct.

!!!info
    The EdDSA signature scheme does not use standard curves such as ed1559. The reason is that in a zk-SNARK circuit, variables live in $\mathbb{F}_r$, which is different from the ed1559's field of definition. To settle this issue, special twisted Edwards curves have been created which are defined on $\mathbb{F}_r$.

 Before diving into the implementation, let's think about what will be the witnesses of the circuit, that is the variables that need to be provided to verify an eddsa signature.

 To verify a signature, the signer's public key is needed. The public key is just a point on the twisted Edward curve, so a tuple $(x,y)$. We also need to store the parameters of the twisted Edwards curve in the public key, so that when accessing a public key one has access to the corresponding curve. 
 
 Let's create the struct containing the twisted Edwards curve parameter:

```go
package twistedEdwards

import (
    "github.com/consensys/gnark-crypto/ecc"
    "math/big"
)

type EdCurve struct {
	A, D, Cofactor, Order, BaseX, BaseY, Modulus big.Int
	ID                                           ecc.ID
}
```

!!!note
    In gnark, different curves are supported. Therefore an ID is supplied to conveniently chose the curve.

Now we can define the struct storing the public key:

```go
package eddsa

import "github.com/consensys/gnark/std/algebra/twistededwards"

type PublicKey struct {
	A     twistededwards.Point
	Curve twistededwards.EdCurve
}
```

!!!note
    The package `twistededwards` defines the structure point as a tuple $(x,y)$ of frontend.Variables. This structure has the associated methods to the elliptic curve group structure, like scalar multiplication.

 An EdDSA signature of a message (which we suppose is already hashed) is a tuple $(R,S)$ where $R$ is a point $(x,y)$ on the twisted Edwards curve, and $S$ is a scalar. The scalar $S$ is used to perform a scalar multiplication on the twisted Edwards curve.

 **Problem**: remember that the variables in a circuit live in $\mathbb{F}_r$. So do the points on the twisted Edwards curve. However the scalar $S$ does not belong to this field. It is reduced modulo $q$, the number of points of the twisted Edwards curve, can be greater than $r$. So when $S$ is passed as a witness to the circuit, $S$ is implicitly reduced modulo $r$. If $S < r$, there is no problem. However, if $S>r$, $S$ is reduced to $S'=S[r]$ and $S'[q]\neq S[q]$, which leads to a bug.
 
 **Solution**: The solution to this is to split $S$ in a small base, like $2^{128}$ if $r$ is $256$-bits for instance, and write $S=2^{128}*S_1+S_2$. This way, $S_1$ and $S_2$ are not reduced modulo $r$ and the bug is fixed.

Now we can define the structure for storing a signature:

```go
import "github.com/consensys/gnark/frontend"

type Signature struct {
	R      twistededwards.Point
	S1, S2 frontend.Variable // S = S1*basis + S2, where basis if 1/2 log r (ex 128 in case of bn256)
}
```

Now that the convenient structures are created, we can write the core of the EdDSA verification algorithm. Let's recall the operations of the signature verification. Let $G$ be the base point of the twisted Edward curve, that is the point such that $[k]G=A$, where $k$ is the secret key of the signer, and $A$ its public key. Given a message $M$, a signature $(R,S)$, a public key $A$ and a hash function $H$ (the same that has been used for signing), the verifier must check that the following relation holds:
$$
[2^c*S]G = [2^c]R +[2^cH(R,A,M)]A
$$

!!!info
    $c$ is either $2$ or $3$, depending on the twisted Edwards curve.

First things first, let's define the signature of the `Verify` function. This function needs a signature, a message and a public key. It also needs a `frontend.ConstraintSystem` object, on which the functions from the [gnark API](../write/circuit_api.md) are called.

```go
func Verify(cs *frontend.ConstraintSystem, sig Signature, msg frontend.Variable, pubKey PublicKey) error {
    return nil
}
```

The first operation is to compute $H(R,A,M)$. The hash function is not given as parameters here, because only a specific snark-friendly hash function can be used, so we hard code the use of the mimc hash function:

```go
import (
	"github.com/consensys/gnark/frontend"
	"github.com/consensys/gnark/std/algebra/twistededwards"
	"github.com/consensys/gnark/std/hash/mimc"
)

func Verify(cs *frontend.ConstraintSystem, sig Signature, msg frontend.Variable, pubKey PublicKey) error {

    // compute H(R, A, M)
	data := []frontend.Variable{
		sig.R.A.X,
		sig.R.A.Y,
		pubKey.A.X,
		pubKey.A.Y,
		msg,
	}
    hash, err := mimc.NewMiMC("seed", pubKey.Curve.ID)
	if err != nil {
		return err
	}
	hramConstant := hash.Hash(cs, data...)

    return nil
}
```

Next part is to compute the left-hand side of the equality, that is $[2^c*S]G$:

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

!!!note
    Notice the use of `ScalarMulFixedBase` when the point coordinates are in `big.Int`, and `ScalarMulNonFixedBase` when the point coordinates are in `frontend.Variable`. The former costs less constraints, so it should be used whenever the coordinates of the point to multiply are not of type `frontend.Variable`.

We continue the implementation with the computation of the right-hand side:

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

Until now, we have only used objects which are defined in the `gnark` standard library: we used the `twistededwards` library and the `mimc` library. For all the methods that we have used, we passed the `cs` parameter, of type `*frontend.ConstraintSystem`, which contains the description of the constraint system. However, we never actually used the [gnark API](../write/circuit_api.md). Now is time to use it, to assert that the left-hand side is equal to the right-hand side.

```go
    // ensures that lhs==rhs
    cs.AssertIsEqual(lhs.X, rhs.X)
	cs.AssertIsEqual(lhs.Y, rhs.Y)
```

!!!info
    Currently, `AssertIsEqual` doesn't work on arbitrary structure. Therefore to enforce equality between the lhs and the rhs, we need to use `AssertIsEqual` on the X and Y part of the lhs and the rhs individually.

We are done writing the eddsa implementation, now it's time to test it. To do so we need a structure implementing a `Define` function as decribed [here](../HowTow/write/circuit_structure.md). The structure should contain the witnesses as `frontend.Variable` that are needed for an EdDSA signature verification. As we have seen, we need a public key, a signature $(R,S)$, and a message:

```go
package main

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

We need a `Define` function describing the mathematical statement that must be verified. We did $99$% of this job with the implementation `Verify` earlier, now it's just a matter of piecing parts together.

```go
import (
	"github.com/consensys/gnark/std/algebra/twistededwards"
	"github.com/consensys/gnark-crypto/ecc"
)

func (circuit *eddsaCircuit) Define(curveID ecc.ID, cs *frontend.ConstraintSystem) error {

	params, err := twistededwards.NewEdCurve(curveID)
	if err != nil {
		return err
	}
	circuit.PublicKey.Curve = params

	// verify the signature in the cs
	eddsa.Verify(cs, circuit.Signature, circuit.Message, circuit.PublicKey)

	return nil
}
```

To actually test the circuit, we need to generate an EdDSA signature, assign the signature on the circuit's witnesses, and verify that the circuit has been correctly solved.

To generate the signature, we will use the module `github.com/consensys/gnark-crypto/ecc/bn254/twistededwards/eddsa`. There is an implementation of eddsa for several curves, here we chose `bn254`.

```go
import (
	"math/big"
	"math/rand"
	"os"

	"github.com/consensys/gnark-crypto/hash"
	eddsabn254 "github.com/consensys/gnark-crypto/ecc/bn254/twistededwards/eddsa"
	"github.com/consensys/gnark-crypto/signature"
)

func main() {

	signature.Register(signature.EDDSA_BN254, eddsabn254.GenerateKeyInterfaces)

	hFunc := hash.MIMC_BN254.New("seed")
	src := rand.NewSource(0)
	r := rand.New(src)
	privKey, err := signature.EDDSA_BN254.New(r)
	if err != nil {
		fmt.Printf("Error generating key pair %s", err)
		os.Exit(-1)
	}
	pubKey := privKey.Public()

	// pick a message to sign
	var frMsg big.Int
	frMsg.SetString("44717650746155748460101257525078853138837311576962212923649547644148297035978", 10)
	msgBin := frMsg.Bytes()

	// generate signature
	signature, err := privKey.Sign(msgBin[:], hFunc)
	if err != nil {
		fmt.Printf("Error generating the signature %s", err)
		os.Exit(-1)
	}

	// check if there is no problem in the signature
	checkSig, err := pubKey.Verify(signature, msgBin[:], hFunc)
	if err != nil {
		fmt.Printf("Error verifying the signature %s", err)
		os.Exit(-1)
	}
	if !checkSig {
		fmt.Printf("Signature verification returns false")
		os.Exit(-1)
	}

}
```

We need to compile the circuit defining the eddsa signature verification.

```go
import (
	...

	"fmt"
	"os"

	"github.com/consensys/gnark-crypto/ecc"
	"github.com/consensys/gnark/backend"
)
func main {

	...

	// create and compile the circuit for signature verification
	var circuit eddsaCircuit
	r1cs, err := frontend.Compile(ecc.BN254, backend.GROTH16, &circuit)
	if err != nil {
		fmt.Printf("Error when compiling the circuit %s", err)
		os.Exit(-1)
	}

}
```

The `r1cs` is the arithmetized version of the circuit. It is a list of constraints that the prover needs to fullfill by providing a satisfying inputs, namely a correct signature on a message.

We run the Groth16 setup to get the public and private keys linked to the circuit.

```go
import (
	...
	"github.com/consensys/gnark/backend/groth16"
)

func main {

	...

	// generating pk, vk
	pk, vk, err := groth16.Setup(r1cs)
	if err != nil {
		fmt.Printf("Error during the setup %s", err)
		os.Exit(-1)
	}

}
```

As the prover, we need to generate witnesses, which are the data needed for verifying a signature. We have done that when we generated the signature earlier. We can now assign the result of the signature to the witnesses.

```go
import (
	...
	edwardsbn254 "github.com/consensys/gnark-crypto/ecc/bn254/twistededwards"
)

func main {

	...

	// witness assignment
	var witness eddsaCircuit
	witness.Message.Assign(frMsg)

	pubKeyBytes := pubKey.Bytes()
	var bufPointBn254 edwardsbn254.PointAffine
	bufPointBn254.SetBytes(pubKeyBytes[:32])
	axb := bufPointBn254.X.Bytes()
	ayb := bufPointBn254.Y.Bytes()
	witness.PublicKey.A.X.Assign(axb[:])
	witness.PublicKey.A.Y.Assign(ayb[:])

	bufPointBn254.SetBytes(signature[:32])
	rxb := bufPointBn254.X.Bytes()
	ryb := bufPointBn254.Y.Bytes()
	witness.Signature.R.X.Assign(rxb[:])
	witness.Signature.R.Y.Assign(ryb[:])

	// The S part of the signature is a 32 bytes scalar stored in signature[32:64].
	// As decribed earlier, we split is in S1, S2 such that S = 2^128*S1+S2 to prevent
	// overflowing the underlying representation in the circuit.
	witness.Signature.S1.Assign(signature[32:48])
	witness.Signature.S2.Assign(signature[48:])

}
```

We are almost done! All that we need to do now is to generate the proof and verify it.

```go
func main {

	...

	// generate the proof
	proof, err := groth16.Prove(r1cs, pk, &witness)
	if err != nil {
		fmt.Printf("Error generating the proof %s", err)
		os.Exit(-1)
	}

	// verify the proof
	err = groth16.Verify(proof, vk, &witness)
	if err != nil {
		fmt.Printf("Error verifying the proof %s", err)
		os.Exit(-1)
	}
}
```