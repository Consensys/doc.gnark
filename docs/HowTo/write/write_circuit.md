---
description: How to write a gnark circuit
---

# How to write a `gnark` circuit

{!HowTo/checkout_concepts.md!}


## Circuit structure

A `gnark` circuit must implement the `frontend/Circuit` interface

```go
type Circuit interface {
	// Define declares the circuit's Constraints
	Define(curveID ecc.ID, cs *ConstraintSystem) error
}
```

and must declare its [public and secret inputs]() as `frontend.Variable`:

```go
type MyCircuit struct {
    X frontend.Variable
    Y frontend.Variable `gnark:",public"`
}
```

At compile time, `frontend.Compile(...)` (recursively) parses the struct fields that contains `frontend.Variable` to build the `frontend.ConstraintSystem`. 

**By default, a `frontend.Variable` has the `gnark:",secret"` visibility**.

???note "Struct tags"
	Similarly to standard Go packages (like `encoding/json`), struct fields can have tags, which adds important metadata to input declaration.

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

## Circuit APIs

As described above, `MyCircuit` will implement 

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
	Constants bigger than base field modulus, they will be reduced mod fr. 

!!! important
	Notice that we have two types of constraints: 

	* computational constraints (`cs.Mul`, `cs.Add`, `cs.Div`, ...)
	* assertions (`cs.AssertIsEqual`, `cs.AssertIsBoolean`, ...)

## Reusing circuit components (aka *gadgets*)

Other ZKP libraries introduced the term *gadget* to describe circuit composition. 

With `gnark` there is no need for *gadgets*, as you can just use functions, that can live, be versionned and tested in a Go package like any other piece of code.  

`gnark` provides a [standard library](standard_library.md) with common functions like hashes or signature verification. 

## Example

Refer to the [zk-rollup operator tutorial]() for a detailed use case. 
