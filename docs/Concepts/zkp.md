---
description: What are zero knowledge proofs
---

thomas

A ZK-SNARK is a cryptographic construction that allows one to provide a proof of knowledge (**ARgument of knowledge**) of private inputs satisfying a public mathematical statement, without leaking any information on the inputs (**Zero Knowledge**). In addition, verifying a proof is a computational operation which is at worst logarithmic in the size of the mathematical statement (**Succint**), and the procedure of proving and verifying a proof requires no interaction between the prover and the verifier except passing the proof to the verifier (**Non interactive**).

If one removes the **Succintness** property, standard examples of ZK-NARK are digital signatures algorithms ECDSA and EDDSA, which are in fact applications of the Schnorr identification protocol. It is essentially an argument of knowledge to prove knowledge  of the discrete  log of a point in a group where the discrete log is hard. Verifying such signatures is not computationally costly, but does not verify the **Succintness** property as it was previously defined.

The signature schemes are very specific mathematical statements, or **circuit**. With `gnark`, one can in fact write any mathematical statement using the gnark API. An instance of such a mathematical statement is Hash(x)==y, where y is public and x private. A valid proof of such a statement ensures that the creator of the proof knows x such that Hash(x)=y, without revealing x.

ZK-SNARK is a very active area of academic research with improvments and new protocols announced week-by-week.  For example, according to [this overview article](https://nakamoto.com/cambrian-explosion-of-crypto-proofs/) we saw the following new ZKP protocols in 2019: Libra, Sonic, SuperSonic, PLONK, SLONK, Halo, Marlin, Fractal, Spartan, Succinct Aurora, RedShift, AirAssembly.

There are many good expositions of ZK-SNARKs. We recommend [this explainer](https://z.cash/technology/zksnarks/) by the fine people behind ZCash and [this curated list of references](https://github.com/matter-labs/awesome-zero-knowledge-proofs).

gautam

A zero-knowledge proof (ZKP) provides cryptographic assurance of **computational integrity** and **privacy**.

Let's unpack those terms:

1. **Computational integrity.** Alice wishes to convince Bob that she executed a program $P$ correctly on input $x$, obtaining output $y=P(x)$. The cost to Bob must be far smaller than the cost of simply executing $P$ himself.
2. **Privacy.** Alice wishes to convince Bob that she knows a secret input $x$ that leads to the output $y=P(x)$ without revealing any information about $x$ to Bob.

These features are well-suited to decentralized finance.  For example:

* **Computational integrity** enables incredible advances in scalability---up to thousands of transactions per second!---as exemplified by projects such as [ZK-Rollup](https://medium.com/matter-labs/optimistic-vs-zk-rollup-deep-dive-ea141e71e075) for Ethereum.
* **Privacy** enables confidential, anonymous transactions as exemplified by projects such as [ZCash](https://z.cash/).

You may have heard the term **zk-SNARK** (zero-knowledge Succinct Non-interactive ARgument of Knowledge).  It refers to a class of ZKPs that meet certain specific conditions on the costs borne by the parties in a ZKP protocol.  For simplicity in this article we prefer the term _zero-knowledge proof (ZKP)_.

ZKP is a very active area of academic research with improvments and new protocols announced week-by-week.  For example, according to [this overview article](https://nakamoto.com/cambrian-explosion-of-crypto-proofs/) we saw the following new ZKP protocols in 2019: Libra, Sonic, SuperSonic, PLONK, SLONK, Halo, Marlin, Fractal, Spartan, Succinct Aurora, RedShift, AirAssembly.

common

There are many good expositions of ZKPs. We recommend [this explainer](https://z.cash/technology/zksnarks/) by the fine people behind ZCash and [this curated list of references](https://github.com/matter-labs/awesome-zero-knowledge-proofs).