---
description: Using hints for off-circuit computations
---

# Compiler hints

Instead of computing some value within a circuit, it's sometimes more optimal
to compute the value off-circuit and only verify the correctness of the
computation in a circuit. `gnark` allows you to do this through *hints*. From the prover's point of view, hints are
essentially input variables provided by a hint function instead of the
user.

For example, consider a decomposition of an integer `a` into bits. A naive
way to decompose it is to look at the binary representation of the integer and
extract bits from this representation, but `gnark` doesn't currently provide
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
for constructing simple hint functions, which takes a constant number of inputs and
returns a constant number of outputs.
