---
description: gnark standard library
---

# `gnark` standard library

!!! note
     `gnark/std` will be strengthened in upcoming `v0.5.0` release. See this [Github issue](https://github.com/ConsenSys/gnark/issues/80) for more details.

Other ZKP libraries introduced the term *gadget* to describe circuit composition. 

With `gnark` there is no need for *gadgets*, as you can just use functions, that can live, be versionned and tested in a Go package like any other piece of code.

We provide in `gnark/std` the following functions:

???example "MiMC hash"
    ```go
    func (circuit *mimcCircuit) Define(curveID ecc.ID, cs *frontend.ConstraintSystem) error {
        // ...
        hFunc, _ := mimc.NewMiMC("seed", curveID)
        computedHash := hFunc.Hash(cs, circuit.Data)
        // ...
    }
    ```
???example "EdDSA signature verification"
    ```go
    type eddsaCircuit struct {
        PublicKey eddsa.PublicKey           `gnark:",public"`
        Signature eddsa.Signature           `gnark:",public"`
        Message   frontend.Variable         `gnark:",public"`
    }

    func (circuit *eddsaCircuit) Define(curveID ecc.ID, cs *frontend.ConstraintSystem) error {
        edCurve, _ := twistededwards.NewEdCurve(curveID)
        circuit.PublicKey.Curve = edCurve

        eddsa.Verify(cs, circuit.Signature, circuit.Message, circuit.PublicKey)
        return nil
    }
    ```
???example "Merkle proof verification"
    ```go
    type merkleCircuit struct {
        RootHash     frontend.Variable `gnark:",public"`
        Path, Helper []frontend.Variable
    }

    func (circuit *merkleCircuit) Define(curveID ecc.ID, cs *frontend.ConstraintSystem) error {
        hFunc, _ := mimc.NewMiMC("seed", curveID)
        merkle.VerifyProof(cs, hFunc, circuit.RootHash, circuit.Path, circuit.Helper)
        return nil
    }
    ```
???example "zkSNARK verifier"
    !!!info
        enables verifying a *BLS12_377* Groth16 `Proof` inside a *BW6_761* circuit
    ```go
    type verifierCircuit struct {
        InnerProof Proof
        InnerVk    VerifyingKey
        Hash       frontend.Variable
    }

    func (circuit *verifierCircuit) Define(curveID ecc.ID, cs *frontend.ConstraintSystem) error {
        // pairing data
        var pairingInfo sw.PairingContext
        pairingInfo.Extension = fields.GetBLS377ExtensionFp12(cs)
        pairingInfo.AteLoop = 9586122913090633729

        // create the verifier cs
        groth16.Verify(cs, pairingInfo, circuit.InnerVk, circuit.InnerProof, []frontend.Variable{circuit.Hash})

        return nil
    }
    ```
