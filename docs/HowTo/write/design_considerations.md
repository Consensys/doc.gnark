---
description: gnark circuit design considerations
---

# Design considerations

{!HowTo/checkout_concepts.md!}


## Programmability

:warning: ==**Important**== :warning:

`Circuit` are programmable but you can't (*practically* and *efficiently*) prove any algorithm. 

Some things are more *natural* ("snark-friendly") than others to do in a circuit, and it all comes down to how constraints are represented in the [constraint system](../../Concepts/circuits.md). 

The *numbers* used in the constraints are not integers or floats, but finite field elements (i.e. big numbers modulo a big prime $p$). 

So when you write `a = b * c`, not only you don't have the liberty to specify *types* for these variables (ie `float`, `int`, ...) but you must worry about field overflow. 

Some cryptographic constructs, like MiMC hash or EdDSA signature scheme, where designed to work on those field elements, and are particularly suited to be used in a zk-SNARK setting. 

**That is why zk-SNARKs are mostly used to verify hashes, signatures or other "snark friendly" cryptographic primitives.** 

Here is a (non-exhaustive) list of things that you may be used to do in a traditional programming language, but are un-natural in most zk-SNARK constructs:

* Using `float`
* Doing conditional (`if` / `else` statements)
* Managing memory
* ...


!!!info
    Like other projects in the zk-SNARK/Blockchain space, we're actively researching ways to make zk-SNARKs more programmable, through use of proof recursion -- proof verifying proof(s) --  or zk-virtual machines, for example. 

    One of `gnark` goal is to enable ZK² rollups -- ie have fully programmable rollups (L2) anchored on a blockchain (L1). 

## Performance

The [Proving schemes and curves](../../../Concepts/schemes_curves.md) section gives some insight into `Prover` and `Verifier` performance, accross scheme and curve choices.

In a `Circuit` one wants to minimize the number of constraints. The `frontend` package does a lot of work behind the scenes to, for example **lazily evaluate linear expressions to minimize constraints**. That part is transparent for the circuit developer.

##### Operation cost may not be intuitive

For example doing a field division *outside* a `Circuit` is something algorithms tend to avoid as it is very costly.

However, doing that in a `Circuit` is cheap. Writing `a = b / c` will be encoded into a constraint `assert(c * a == b)` (ie one multiplicative constraint only).

On the other hand, the seamingly simple operation of a range check (`assert(a < c)`) is costly as it involves decomposing the variables into bits (still represented on large field elements!).

Finally, if one needs variables which exceed the modulus $p$, a standard method is to split the variable in a smaller basis that $p$ (for instance $(p-1)/2$), and write the concerned variables in this basis. Each digit of the resulting decomposition will be smaller than $p$, and therefore will not be reduced.