---
description: What are zero knowledge proofs
---

A zero-knowledge proof (ZKP) provides cryptographic assurance of **computational integrity** and **privacy**.

Let's unpack those terms:

1. **Computational integrity.** Alice wishes to convince Bob that she executed a program $P$ correctly on input $x$, obtaining output $y=P(x)$. The cost to Bob must be far smaller than the cost of simply executing $P$ himself.
2. **Privacy.** Alice wishes to convince Bob that she knows a secret input $x$ that leads to the output $y=P(x)$ without revealing any information about $x$ to Bob.

These features are well-suited to decentralized finance.  For example:

* **Computational integrity** enables incredible advances in scalability---up to thousands of transactions per second!---as exemplified by projects such as [ZK-Rollup](https://medium.com/matter-labs/optimistic-vs-zk-rollup-deep-dive-ea141e71e075) for Ethereum.
* **Privacy** enables confidential, anonymous transactions as exemplified by projects such as [ZCash](https://z.cash/).

You may have heard the term **zk-SNARK** (zero-knowledge Succinct Non-interactive ARgument of Knowledge).  It refers to a class of ZKPs that meet certain specific conditions on the costs borne by the parties in a ZKP protocol.  For simplicity in this article we prefer the term _zero-knowledge proof (ZKP)_.

ZKP is a very active area of academic research with improvments and new protocols announced week-by-week.  For example, according to [this overview article](https://nakamoto.com/cambrian-explosion-of-crypto-proofs/) we saw the following new ZKP protocols in 2019: Libra, Sonic, SuperSonic, PLONK, SLONK, Halo, Marlin, Fractal, Spartan, Succinct Aurora, RedShift, AirAssembly.

There are many good expositions of ZKPs. We recommend [this explainer](https://z.cash/technology/zksnarks/) by the fine people behind ZCash and [this curated list of references](https://github.com/matter-labs/awesome-zero-knowledge-proofs).