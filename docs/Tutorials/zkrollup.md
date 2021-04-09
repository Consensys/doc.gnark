---
description: How to write a ZK-Rollup operator circuit with gnark
---

TODO @thomas 

Maybe (suggestion) , to simplify this tutorial, picking something like a simple signature or merkle proof / hash will suffice. 
One of or example, a bit more verbose with step by step reasoning, and ==demonstrating as many gnark features as possible==, including maybe: `Println`, `tests`, switch to another proof system easily, ... etc; 

---
# A ZK-Rollup operator

This tutorial walks through a (simplistic) zk-rollup operator circuit.

In a blockchain context, a rollup operator needs to prove the validity of a batch of transaction. More [detail here](). TODO.

This is an interesting use case for `gnark`, as the resulting circuit is non trivial. It must validate account balances, state transitions and contains merkle proof and signature verifications, among other things.

TODO 