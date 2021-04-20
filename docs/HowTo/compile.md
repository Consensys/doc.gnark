---
description: How to compile gnark circuits
---

# Compile a `gnark` circuit

Using `frontend.Compile`, a [circuit definition](write/circuit_structure.md) is converted into an arithmetic representation.

Roughly speaking, the `frontend.Compile` method takes a "high level program" and translates it in a sequence of constraints which have a simple mathematic form.

```go
var myCircuit Circuit
r1cs, err := frontend.Compile(ecc.BN254, backend.GROTH16, &myCircuit)
```

We must specify `zkpID` (`Groth16` or `PLONK`) at this stage, as the `CompiledConstraintSystem` (ie the *arithmetic representation*) is strongly typed towards a proving scheme.
