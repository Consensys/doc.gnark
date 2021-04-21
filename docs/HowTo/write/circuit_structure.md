---
description: gnark circuit structure
---

# Circuit structure

A `gnark` circuit must implement the `frontend/Circuit` interface:

```go
type Circuit interface {
    // Define declares the circuit's Constraints
    Define(curveID ecc.ID, cs *frontend.ConstraintSystem) error
}
```

The circuit must declare its
[public and secret inputs](../../Concepts/zkp.md#public-and-secret-inputs) as `frontend.Variable`:

```go
type MyCircuit struct {
    C myComponent
    Y frontend.Variable `gnark:",public"`
}

type myComponent struct {
    X frontend.Variable
}

func (circuit *MyCircuit) Define(curveID ecc.ID, cs *frontend.ConstraintSystem) error {
    // ... see Cicuit API section
}
```

At compile time, `frontend.Compile(...)` recursively parses the struct fields that contains
`frontend.Variable` to build the `frontend.ConstraintSystem`.

By default, a `frontend.Variable` can view `gnark:",secret"`.

!!! note "Struct tags"

    Similar to standard Go packages (like `encoding/json`), struct fields can have tags which
    adds important metadata to input declarations.

    Other tag options:

    ```go
    // omits Y, frontend.Compile will not instantiate a new variable in the ConstraintSystem
    // this can be useful when a Variable is referenced in multiple places but we only wish to instantiate it once
    Y frontend.Variable `gnark:"-"`
    ```

    ```go
    // embeds a Variable or struct
    // can be helpful for test purposes, where one may want to test part of a circuit and redefine
    // the Define method on another struct while keeping the same inputs
    type circuitSignature struct {
        Circuit `gnark:",embed"`
    }
    ```
