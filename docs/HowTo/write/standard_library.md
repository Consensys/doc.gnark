---
description: gnark standard library
---

# `gnark` standard library

!!! note

    `gnark/std` will be improved in the `v0.5.0` release. See this
    [Github issue](https://github.com/ConsenSys/gnark/issues/80) for more details.

We provide the following functions in `gnark/std`:

=== "MiMC hash"

    ```go
    func (circuit *mimcCircuit) Define(curveID ecc.ID, api frontend.API) error {
        // ...
        hFunc, _ := mimc.NewMiMC("seed", curveID)
        computedHash := hFunc.Hash(cs, circuit.Data)
        // ...
    }
    ```

=== "EdDSA signature verification"

    ```go
    type eddsaCircuit struct {
        PublicKey eddsa.PublicKey           `gnark:",public"`
        Signature eddsa.Signature           `gnark:",public"`
        Message   frontend.Variable         `gnark:",public"`
    }

    func (circuit *eddsaCircuit) Define(curveID ecc.ID, api frontend.API) error {
        edCurve, _ := twistededwards.NewEdCurve(curveID)
        circuit.PublicKey.Curve = edCurve

        eddsa.Verify(cs, circuit.Signature, circuit.Message, circuit.PublicKey)
        return nil
    }
    ```

=== "Merkle proof verification"

    ```go
    type merkleCircuit struct {
        RootHash     frontend.Variable `gnark:",public"`
        Path, Helper []frontend.Variable
    }

    func (circuit *merkleCircuit) Define(curveID ecc.ID, api frontend.API) error {
        hFunc, _ := mimc.NewMiMC("seed", curveID)
        merkle.VerifyProof(cs, hFunc, circuit.RootHash, circuit.Path, circuit.Helper)
        return nil
    }
    ```

=== "zk-SNARK verifier"

    Enables verifying a *BLS12_377* Groth16 `Proof` inside a *BW6_761* circuit

    ```go
    type verifierCircuit struct {
        InnerProof Proof
        InnerVk    VerifyingKey
        Hash       frontend.Variable
    }

    func (circuit *verifierCircuit) Define(curveID ecc.ID, api frontend.API) error {
        // pairing data
        var pairingInfo sw.PairingContext
        pairingInfo.Extension = fields.GetBLS377ExtensionFp12(cs)
        pairingInfo.AteLoop = 9586122913090633729

        // create the verifier cs
        groth16.Verify(cs, pairingInfo, circuit.InnerVk, circuit.InnerProof, []frontend.Variable{circuit.Hash})

        return nil
    }
    ```
