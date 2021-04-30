---
description: How to write a gnark circuit
---

# Circuit APIs

As described in [Circuit structure](circuit_structure.md), `MyCircuit` implements:

```go
func Define(curveID ecc.ID, cs *frontend.ConstraintSystem) error
```

* `curveID` is injected at compile time to handle different code paths depending on the curve
    (for example, hash functions like MiMC have variations depending on the `curveID`)

* `cs` is the root object to manipulate when defining constraints.

Use `x² := cs.Mul(x, x)` to write $x \times x$. For example, to prove that we know the solution to
the cubic equation $x^3 + x + 5 = y$, write:

```go
x3 := cs.Mul(circuit.X, circuit.X, circuit.X)
cs.AssertIsEqual(circuit.Y, cs.Add(x3, circuit.X, 5))
```

!!! info

    APIs, when possible, take a variadic list of `frontend.Variable` and `interface{}`.
    This allows flexibility on the circuit definition side when coding, for example:

    ```go
    cs.Mul(X, 2, cs.Add(Y, Z, 42))
    ```

    Constants bigger than base field modulus will be reduced $\mod n$.

## Reusing circuit components

Other zk-SNARK libraries introduced the term *gadget* to describe circuit composition.

`gnark` has no need for *gadgets*, because you can use functions that can live, be
versioned, and tested in a Go package like any other piece of code.

`gnark` provides a [standard library](standard_library.md) with common functions like hashes or
signature verification.

## Reference

Refer to the [Go package documentation] for a complete list of the API with examples.

Refer to the [EdDSA tutorial](../../Tutorials/eddsa.md) for an example.

<!--links-->
[Go package documentation]: https://pkg.go.dev/mod/github.com/consensys/gnark@{{content_vars.gnark_version}}/frontend
