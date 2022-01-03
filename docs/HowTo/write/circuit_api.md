---
description: How to write a gnark circuit
---

# Circuit APIs

As described in [Circuit structure](circuit_structure.md), `MyCircuit` implements:

```go
func Define(api frontend.API) error
```

* `api` is the root object to manipulate when defining constraints.

Use `x² := api.Mul(x, x)` to write $x \times x$. For example, to prove that we know the solution to
the cubic equation $x^3 + x + 5 = y$, write:

```go
x3 := api.Mul(circuit.X, circuit.X, circuit.X)
api.AssertIsEqual(circuit.Y, api.Add(x3, circuit.X, 5))
```

!!! info

    APIs, when possible, take a variadic list of `frontend.Variable` and `interface{}`.
    This allows flexibility on the circuit definition side when coding, for example:

    ```go
    api.Mul(X, 2, api.Add(Y, Z, 42))
    ```

    Constants bigger than base field modulus will be reduced $\mod n$.

## Compiler hints

Also known as "advice wires", hints are a way to tell the constraint solver how to compute a value.
For example, to get the i-th bit of a variable, write:

```go
b[i] = cs.NewHint(hint.IthBit, a, i)
```

!!! warning

    Circuit developer must constraint the hints. From the `Prover` point of view, one can see a hint as a user defined `frontend.Variable`.

    For example, in most cases, to ensure the extracted bit is really the i-th bit of a variable, one must boolean constrain the bits, and constraint the weighted sum of the bits to be equal to `a`:

    ```go
    cs.AssertIsBoolean(b[i])
    // Σ (2**i * b[i]) == a
    // ... 
    ```

User-defined hints are possible, see `cs.NewHint()` and `backend/hint` for more details. 

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
