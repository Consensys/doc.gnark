---
description: How to create and verify proofs
---


# Create and verify a `Proof` 

!!!example
    === "Groth16"

        ```go
        pk, vk, _ := groth16.Setup(cs)
        proof, _ := groth16.Prove(cs, pk, witness)
        _ := groth16.Verify(proof, vk, publicWitness)

        ```

    === "PLONK"

        ```go
        publicData, _ := plonk.Setup(cs, ...) // WIP
        proof, _ := plonk.Prove(r1cs, publicData, witness)
        _ := plonk.Verify(proof, publicData, publicWitness)

        ```

# Construct the witness

Within a Go process, the best way to construct a witness is to re-use the circuit data structure. 

```go
type Circuit struct {
	X frontend.Variable
	Y frontend.Variable `gnark:",public"`
}
var witness Circuit
witness.X.Assign(3)
witness.Y.Assign(35)
// use the witness directly in ZKP backend APIs
groth16.Prove(cs, pk, &witness)
// test file --> assert.ProverSucceeded(cs, &witness)
```

!!!tip
    If witness is not build within the same process, or in another programming language, refer to [Serialize](serialize/serialize.md).


# Verify a `Proof` on Ethereum

On `ecc.BN254` + `Groth16`, `gnark` can export the `groth16.VerifyingKey` as a solidity smart contract.

See [this example](https://github.com/ConsenSys/gnark-tests/blob/main/solidity/contract/main.go).
