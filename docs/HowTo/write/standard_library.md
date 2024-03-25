---
title: Standard library
description: gnark standard library
sidebar_position: 4
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# `gnark` standard library

We provide the following functions in `gnark/std`:

<Tabs>
  <TabItem value="MiMC hash" label="MiMC hash" >

```go
func (circuit *mimcCircuit) Define(api frontend.API) error {
    // ...
    hFunc, _ := mimc.NewMiMC(api.Curve())
    computedHash := hFunc.Hash(cs, circuit.Data)
    // ...
}
```

  </TabItem>
  <TabItem value="EdDSA signature verification" label="EdDSA signature verification" >

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

  </TabItem>
  <TabItem value="Merkle proof verification" label="Merkle proof verification" >

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

  </TabItem>
  <TabItem value="zk-SNARK verifier" label="zk-SNARK verifier" >

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

  </TabItem>
</Tabs>
