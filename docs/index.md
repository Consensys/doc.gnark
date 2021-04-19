---
title: gnark
description: gnark is a fast, open-source zk-SNARK library written in Go
---

# gnark

## What is `gnark`?

`gnark` is a [zk-SNARK](Concepts/zkp.md) library. It offers a [high-level API](HowTo/write/circuit_api.md) to easily design [circuits](Concepts/circuits.md) and fast implementation of state of the art zk-SNARKs.

1. In a typical workflow, one starts [implementing an algorithm](HowTo/write/circuit_api.md) -- for which we want to prove and verify its execution. 
2. Then, we use `gnark/frontend` package to [translate this "high level program" into a set of mathematical constraints](HowTo/compile.md).
3. Finally, we use `gnark/backend` to [create and verify our **proof of knowledge**](HowTo/prove.md): we prove we know a list of **secret inputs** satisfying a set of mathematical constraints.

!!! warning
    `gnark` has not been audited and is provided as-is, use at your own risk. In particular, `gnark` makes no security guarantees such as constant time implementation or side-channel attack resistance.

### `gnark` circuits are written in Go

`gnark` users write their zk-SNARK circuits in plain Go. In contrast to other zk-SNARK libraries, we chose to not develop our own language and compiler.  Here's why:

- [x] Go is a mature and widely used language with a robust toolchain.
- [x] Developers can **debug**, **document**, **test** and **benchmark** their circuits as they would with any other Go program.
- [x] Circuits can be versioned, unit-tested and used in standard continious-delivery workflows.
- [x] IDE integration (we use VSCode) and all these features come for free and are stable accross platforms.

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

## Proving schemes and curves

Refer to the [Proving schemes and curves](Concepts/schemes_curves.md) section. 