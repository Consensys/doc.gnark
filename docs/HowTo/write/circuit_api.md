---
description: How to write a gnark circuit
---

# Circuit APIs 

As described in [Circuit Structure](circuit_structure.md), `MyCircuit` will implement 

```go
func (circuit *MyCircuit) Define(curveID ecc.ID, cs *frontend.ConstraintSystem) error {
```

* `curveID` is injected at compile time to handle different code paths depending on the curve (for example, hash functions like MiMC have variations depending on the `curveID`)

* `cs` is the root object we manipulate when defining constraints. 

To write `x * x`, one simply write `x² := cs.Mul(x, x)`.  

For example, if we want to prove that we know the solution to the cubic equation `x**3 + x + 5 == y`

```go
func (circuit *MyCircuit) Define(curveID ecc.ID, cs *frontend.ConstraintSystem) error {
	x3 := cs.Mul(circuit.X, circuit.X, circuit.X)
	cs.AssertIsEqual(circuit.Y, cs.Add(x3, circuit.X, 5))
	return nil
}
```


!!! info
	APIs, when possible, will take a variadic list of  `frontend.Variable` and / or `interface{}`. This allow flexibility on the circuit definition side to write for example
	```go
	cs.Mul(X, 2, cs.Add(Y, Z, 42))
	```
	Constants bigger than base field modulus will be reduced mod fr. 

!!! important
	Notice that we have two types of constraints: 

	* computational constraints (`cs.Mul`, `cs.Add`, `cs.Div`, ...)
	* assertions (`cs.AssertIsEqual`, `cs.AssertIsBoolean`, ...)

## Reusing circuit components (aka *gadgets*)

Other ZKP libraries introduced the term *gadget* to describe circuit composition. 

With `gnark` there is no need for *gadgets*, as you can just use functions, that can live, be versionned and tested in a Go package like any other piece of code.  

`gnark` provides a [standard library](standard_library.md) with common functions like hashes or signature verification. 

## Reference

Refer to the [Go package documentation]([[![PkgGoDev](https://pkg.go.dev/badge/mod/github.com/consensys/gnark/frontend)]() ](https://pkg.go.dev/mod/github.com/consensys/gnark/frontend)) for a complete list of the API with examples.

Refer to the [zk-rollup operator tutorial]() for a detailed use case. 
