---
title: gnark
description: gnark is a fast, open-source library for zero-knowledge proof protocols written in Go
---

# gnark

## What is gnark?

`gnark` is a framework to execute (and verify) algorithms in zero-knowledge. It offers a high-level API to easily design circuits and fast implementation of state of the art ZKP schemes.

!!! warning
    `gnark` has not been audited and is provided as-is, use at your own risk. In particular, `gnark` makes no security guarantees such as constant time implementation or side-channel attack resistance.

!!! info
    `gnark` is optimized for `amd64` targets (x86 64bits) and tested on Unix (Linux / macOS).

### `gnark` circuits are written in Go

While several ZKP projects chose to develop their own language and compiler for the frontend, we designed a high-level API, in plain Go.

!!! example
    This example shows how to prove knowledge of a pre-image.

    === "1. define circuit"

        ```go
        // Circuit defines a pre-image knowledge proof
        // mimc(secret preImage) = public hash
        type Circuit struct {
            PreImage frontend.Variable
            Hash     frontend.Variable `gnark:",public"`
        }

        // Define declares the circuit's constraints
        func (circuit *Circuit) Define(curveID ecc.ID, cs *frontend.ConstraintSystem) error {
            // hash function
            mimc, _ := mimc.NewMiMC("seed", curveID)

            // specify constraints
            // mimc(preImage) == hash
            cs.AssertIsEqual(circuit.Hash, mimc.Hash(cs, circuit.PreImage))

            return nil
        }
        ```

    === "2. compile circuit"

        ```go
        var mimcCircuit Circuit
        r1cs, _ := frontend.Compile(ecc.BN254, backend.GROTH16, &mimcCircuit)
        ```

    === "3. create proof"

        ```go
        pk, vk, _ := groth16.Setup(r1cs)
        proof, _ := groth16.Prove(r1cs, pk, witness)
        _ := groth16.Verify(proof, vk, publicWitness)

        ```
    === "4. unit test"

        ```go
        assert := groth16.NewAssert(t)

        var mimcCircuit Circuit

        r1cs, err := frontend.Compile(ecc.BN254, backend.GROTH16, &mimcCircuit)
        assert.NoError(err)

        {
            var witness Circuit
            witness.Hash.Assign(42)
            witness.PreImage.Assign(42)
            assert.ProverFailed(r1cs, &witness)
        }

        {
            var witness Circuit
            witness.PreImage.Assign(35)
            witness.Hash.Assign("16130099170765464552823636852555369511329944820189892919423002775646948828469")
            assert.ProverSucceeded(r1cs, &witness)
        }

        ```

Relying on Go ---a mature and widely used language--- and its toolchain, has several benefits.

Developers can **debug, document, test and benchmark** their circuits as they would with any other Go program. Circuits can be versionned, unit tested and used into standard continuous delivery workflows. IDE integration (we use VSCode) and all these features **come for free and are stable** across platforms.

Moreover, `gnark` is not a black box and exposes APIs like a conventional cryptographic library (think `aes.encrypt([]byte)`). Complex solutions need this flexibility --- gRPC/REST APIs, serialization protocols, monitoring, logging, ... are all few lines of code away.


### `gnark` is fast

TODO

## Proving schemes

`gnark` implements:

* [Groth16](https://eprint.iacr.org/2016/260)
* [PLONK](https://eprint.iacr.org/2019/953.pdf)

## Curves

`gnark` supports the following elliptic curves:

* BLS12-381 (Zcash)
* BN254 (Ethereum)
* BLS12-377 (ZEXE)
* BW6-761 (EC supporting pairing on BLS12-377 field of definition)