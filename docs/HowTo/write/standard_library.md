---
title: Standard library
description: gnark standard library
sidebar_position: 4
---

# `gnark` standard library

We provide the following functions in `gnark/std`:

<!--tabs-->

# MiMC hash

```go
func (circuit *mimcCircuit) Define(api frontend.API) error {
    // ...
    hFunc, _ := mimc.NewMiMC(api.Curve())
    computedHash := hFunc.Hash(cs, circuit.Data)
    // ...
}
```

# EdDSA signature verification

```go
type eddsaCircuit struct {
    PublicKey eddsa.PublicKey           `gnark:",public"`
    Signature eddsa.Signature           `gnark:",public"`
    Message   frontend.Variable         `gnark:",public"`
}

func (circuit *eddsaCircuit) Define(api frontend.API) error {
    edCurve, _ := twistededwards.NewEdCurve(api.Curve())
    circuit.PublicKey.Curve = edCurve

    eddsa.Verify(cs, circuit.Signature, circuit.Message, circuit.PublicKey)
    return nil
}
```

# Merkle proof verification

```go
type merkleCircuit struct {
    RootHash     frontend.Variable `gnark:",public"`
    Path, Helper []frontend.Variable
}

func (circuit *merkleCircuit) Define(api frontend.API) error {
    hFunc, _ := mimc.NewMiMC(api.Curve())
    merkle.VerifyProof(cs, hFunc, circuit.RootHash, circuit.Path, circuit.Helper)
    return nil
}
```

# zk-SNARK verifier

Enables verifying a _BLS12_377_ Groth16 `Proof` inside a _BW6_761_ circuit

```go
type verifierCircuit struct {
    InnerProof Proof
    InnerVk    VerifyingKey
    Hash       frontend.Variable
}

func (circuit *verifierCircuit) Define(api frontend.API) error {

    groth16.Verify(api, circuit.InnerVk, circuit.InnerProof, []frontend.Variable{circuit.Hash})

    return nil
}
```

<!--/tabs-->
