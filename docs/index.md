---
title: gnark
description: gnark is a fast, open-source library for zero-knowledge proof protocols written in Go
---

# gnark

## What is `gnark`?

`gnark` is a framework allowing one to build a **proof knowledge** of a list of **private inputs** fullfilling a **public** mathematical statement (referred to as **circuit**, written using the the [gnark API](HowTo/write/circuit_api.md)), with the following properties:

* Verifying that a proof is valid reveals nothing about the private inputs.
* Verifying a proof is a constant time operation regarldess the size of  the mathematical statement.

Such a cryptographic construction is called a [ZK-SNARK](Concepts/zkp.md).

!!! warning
    `gnark` has not been audited and is provided as-is, use at your own risk. In particular, `gnark` makes no security guarantees such as constant time implementation or side-channel attack resistance.

### `gnark` circuits are written in Go

`gnark` users write their ZK-SNARK circuits in plain Go. In contrast to other ZK-SNARK libraries, we chose to not develop our own language and compiler.  Here's why:

* Go is a mature and widely used language with a robust toolchain.
* Developers can **debug**, **document**, **test** and **benchmark** their circuits as they would with any other Go program.
* Circuits can be versioned, unit-tested and used in standard continious-delivery workflows.
* IDE integration (we use VSCode) and all these features come for free and are stable accross platforms.

Moreover, `gnark` exposes its APIs like any conventional cryptographic library (think `aes.encrypt([]byte)`). Complex solutions need this flexibility --- gRPC/REST APIs, serialization protocols, monitoring, logging, are all few lines of code away.

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
            mimc, err := mimc.NewMiMC("seed", curveID)

            // specify constraints
            // mimc(preImage) == hash
            cs.AssertIsEqual(circuit.Hash, mimc.Hash(cs, circuit.PreImage))

            return nil
        }
        ```

    === "2. compile circuit"

        ```go
        var mimcCircuit Circuit
        r1cs, err := frontend.Compile(ecc.BN254, backend.GROTH16, &mimcCircuit)
        ```

    === "3. create proof"

        ```go
        pk, vk, err := groth16.Setup(r1cs)
        proof, err := groth16.Prove(r1cs, pk, witness)
        err := groth16.Verify(proof, vk, publicWitness)

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


### `gnark` is fast

!!!info
    It is difficult to fairly and accurately compare benchmarks among libraries. Some implementations may excel in conditions where others may not: target or available instruction set, CPUs and RAM may have significant impact. 

    Nonetheless, **it appears that `gnark` is faster than state-of-the-art**.

The same circuit is benchmarked using `gnark`, `bellman` (bls12_381, ZCash), `bellman_ce` (bn254, matterlabs).

##### BN254

| nb constraints | 100000|32000000|64000000|
| -------- | --------| -------- | -------- |
| bellman_ce (s/op)|0.43|106|214.8|
| gnark (s/op)  |0.16|33.9|63.4|
| speedup  |x2.6|x3.1|x3.4|

On large circuits, that's **over 1M constraints per second**. 

##### BLS12_381

| nb constraints | 100000|32000000|64000000|
| -------- | --------| -------- | -------- |
| bellman (s/op)|0.6|158|316.8|
| gnark (s/op)  |0.23|47.6|90.7|
| speedup  |x2.7|x3.3|x3.5|

!!!note
    These benchmarks ran on a AWS c5a.24xlarge instance, with hyperthreading disabled.

    They are not recent and [will be updated](https://github.com/ConsenSys/gnark/issues/83).

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