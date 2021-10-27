---
description: How to debug and test gnark circuits
---

# Debug and test circuits

## Common errors

The most common error you may get while trying to create a proof is:

```no-lang
constraint is not satisfied: [(.. * ..) != (.. * ..) + (.. * ..) + (.. * ..)]
```

The error means the solver couldn't satisfy at least one of the constraints with the provided
witness.

!!! note
    In some cases, you may encounter a `couldn't solve computational constraint` error, which means
    the solver couldn't perform an operation needed to verify a constraint.
    For example, a division by 0.

### Print values

The easiest way to debug a circuit is to use `api.Println()`, which behaves like `fmt.Println`, except
it outputs the values when they are solved. For example:

```go
api.Println("A.X", pubKey.A.X)
```

!!! note
    With solving errors and `api.Println`, `gnark` outputs a stack trace which contain the exact line number to refer to in the circuit definition.

## Test

You can implement tests as Go unit tests, in a `_test.go` file. For example:

```go
// assert object wrapping testing.T
assert := groth16.NewAssert(t)

// declare the circuit
var mimcCircuit Circuit

// compile the circuit into a R1CS
r1cs, err := frontend.Compile(ecc.BN254, backend.GROTH16, &mimcCircuit)
assert.NoError(err)

{
    // assign invalid values to a witness, ensure the proof fails
    var witness Circuit
    witness.Hash.Assign(42)
    witness.PreImage.Assign(42)
    assert.ProverFailed(r1cs, &witness)
}

{
    // assign valid values to a witness, ensure the proof is valid
    var witness Circuit
    witness.PreImage.Assign(35)
    witness.Hash.Assign("16130099170765464552823636852555369511329944820189892919423002775646948828469")
    assert.ProverSucceeded(r1cs, &witness)
}
```
