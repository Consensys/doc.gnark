---
title: Compile circuits
description: How to compile gnark circuits
sidebar_position: 3
---

# Compile a `gnark` circuit

Use `frontend.Compile`, to convert a [circuit definition](write/circuit_structure.md) into an arithmetic representation.

The `frontend.Compile` method takes a high-level program and translates it to a sequence of constraints which have a simple mathematic form.

```go
var myCircuit Circuit
r1cs, err := frontend.Compile(ecc.BN254, r1cs.NewBuilder, &myCircuit)
```
