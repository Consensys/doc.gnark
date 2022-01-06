---
description: Using hints for off-circuit computations
---

# Compiler hints

Instead of computing some value within a circuit, it is sometimes more optimal
to compute the value off-circuit and only verify the correctness of the
computation in a circuit. `gnark` provides a way to provide such verifiable
"advice wires" in the way of *hints*. From the prover point of view, these are
essentially input variables which are provided by hint function instead of the
user.

For example, lets consider a decomposition of an integer `a` into bits. A naive
way to do it would be to look at the binary representation of the integer and
extract bits from this representation, but `gnark` does not currently provide
native bit operations. Instead, the hint function `hint.IthBit` can provide the
bits as variables and the user must constrain these variables as a weighted sum
which equals to `a`. In a circuit it would look like:

```go
  var b []frontend.Variable
  var Σbi frontend.Variable
  base := 1
  for i := 0; i < nBits; i++ {
    b[i] = cs.NewHint(hint.IthBit, a, i)
    cs.AssertIsBoolean(b[i])
    Σbi = api.Add(Σbi, api.Mul(b[i], base))
    base = base << 1
  }
  cs.AssertIsEqual(Σbi, a)
```

This particular method is also implemented in the frontends as `ToBinary(...)`
interface method.

`gnark` provides a list of built-in hints. See [package
documentation](https://pkg.go.dev/github.com/consensys/gnark/backend/hint#Function)
for a list of built-int hint functions.

## Implementing hint functions

In addition to built-in hint functions, the developer can also define their own
hint functions. Any instance satisfying the
[`hint.Function`](https://pkg.go.dev/github.com/consensys/gnark/backend/hint#Function)
can be provided to `api.NewHint(...)` method to compute the hint value.
Additionally, the hint function has to be provided as a [`backend.WithHints`
backend option](https://pkg.go.dev/github.com/consensys/gnark/backend#WithHints)
to the backend so that the backend could access the hint function.

`gnark` also provides a constructor
[`hint.NewStaticHint`](https://pkg.go.dev/github.com/consensys/gnark/backend/hint#NewStaticHint)
for constructing simple hint functions which takes constant number of inputs and
returns constant number of outputs.
