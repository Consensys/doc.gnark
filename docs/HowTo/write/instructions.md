---
description: How to use conditional and loops in a gnark circuit
---

# Conditionals and loops

## Loops

Use standard `for` loops inside circuit definition. 

!!!note
	`for` loop impact on the constraint system is identical to unrolling its content  

!!! example "check that `X*X*X*X*X... == Y`" 
	```go
	func (circuit *Circuit) Define(curveID ecc.ID, cs *frontend.ConstraintSystem) error {
		for i := 0; i < n; i++ {
			circuit.X = cs.Mul(circuit.X, circuit.X)
		}
		cs.AssertIsEqual(circuit.X, circuit.Y)
		return nil
	}
	```

 

## Conditionals statements

In an imperative programming language, that would be a `if` / `else`. 

However, it doesn't translate well in a *declarative* API to define the circuit, as the output of the `frontend.Compile` method is an arithmetic representation that must **encode** the various branches. 

`gnark` offers `cs.Select(...)` API, which is similar to Prolog-like languages. 

```go
// Select if b is true, yields i1 else yields i2
func (cs *ConstraintSystem) Select(b Variable, i1, i2 interface{}) Variable {
```

!!!note
	Work is ongoing to provide a `if` like statement. [Github issue](https://github.com/ConsenSys/gnark/issues/81)