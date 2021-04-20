---
description: What are zk-SNARKs
---

# zk-SNARK

    zk-SNARK: Zero-Knowledge Succinct Non-Interactive Argument of Knowledge

A zk-SNARK is a cryptographic construction that allows one to provide a proof of knowledge (**ARgument of knowledge**) of secret inputs satisfying a public mathematical statement, without leaking any information on the inputs (**Zero Knowledge**).

In addition, verifying a proof is a computational operation which is at worst logarithmic in the size of the mathematical statement (**Succint**), and the procedure of proving and verifying a proof requires no interaction between the prover and the verifier except passing the proof to the verifier (**Non interactive**).

**Here is an illustration of those concepts.**

If we don't consider **Succintness**, and if we slightly modify the notion of **Zero knowledgeness** to **Honest Verifier Zero Knowledge** (which is weaker than **Zero Knowledge** property), examples of (HV)ZK-NARK are digital signatures algorithms ECDSA and EDDSA, which are in fact applications of the Schnorr identification protocol. It is essentially an argument of knowledge to prove knowledge  of the discrete  log of a point in a group where the discrete log is hard. Verifying such signatures is not computationally costly, but does not verify the **Succintness** property as it was previously defined.

The signature schemes are very specific mathematical statements, or [**circuits**](circuits.md).

With `gnark`, one can in fact write any circuit using the [gnark API](../HowTo/write/circuit_api.md). An instance of such a circuit is `hash(x) == y`, where y is public and x secret, and `==` is an assertion, not an assignment.

A valid proof of such a statement ensures that the creator of the proof knows x such that hash(x)=y, without revealing x. It is worth noting that if y is not specified, there are an infinity of couples (x,y) verifying hash(x)=y. But if y is specified, only one x verifies this relation.

### Public and secret inputs

Given a mathematical statement, a zk-SNARK separates the inputs as public and secret. Typically, the public inputs are known to everyone, and there is a unique secret input such that secret+public inputs satisfy the statement. It's exactly like a signature: given a valid signature, there is one unique secret key that leads to the signature. However there is an infinity of valid couples (signature, secret key).

-----

zk-SNARK is a very active area of academic research with improvments and new protocols announced week-by-week.  For example, according to [this overview article](https://nakamoto.com/cambrian-explosion-of-crypto-proofs/) we saw the following new zk-SNARK protocols in 2019: Libra, Sonic, SuperSonic, PlonK, SLONK, Halo, Marlin, Fractal, Spartan, Succinct Aurora, RedShift, AirAssembly.

There are many good expositions of zk-SNARKs. We recommend [this explainer](https://z.cash/technology/zksnarks/) by the fine people behind ZCash and [this curated list of references](https://github.com/matter-labs/awesome-zero-knowledge-proofs).
