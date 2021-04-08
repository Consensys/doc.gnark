---
description: How to write a ZK-Rollup operator circuit with gnark
---

# A ZK-Rollup operator

This tutorial walks through a (simplistic) zk-rollup operator circuit.

In a blockchain context, a rollup operator needs to prove the validity of a batch of transaction. More [detail here](). TODO.

This is an interesting use case for `gnark`, as the resulting circuit is non trivial. It must validate account balances, state transitions and contains merkle proof and signature verifications, among other things.

TODO 