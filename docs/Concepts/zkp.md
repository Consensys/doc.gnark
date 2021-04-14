---
description: What are zero knowledge proofs
---

A ZK-SNARK is a cryptographic construction that allows one to provide a proof of knowledge (**ARgument of knowledge**) of private inputs satisfying a public mathematical statement, without leaking any information on the inputs (**Zero Knowledge**). In addition, verifying a proof is a computational operation which is at worst logarithmic in the size of the mathematical statement (**Succint**), and the procedure of proving and verifying a proof requires no interaction between the prover and the verifier except passing the proof to the verifier (**Non interactive**).

If one removes the **Succintness** property, standard examples of ZK-NARK are digital signatures algorithms ECDSA and EDDSA, which are in fact applications of the Schnorr identification protocol. It is essentially an argument of knowledge to prove knowledge  of the discrete  log of a point in a group where the discrete log is hard. Verifying such signatures is not computationally costly, but does not verify the **Succintness** property as it was previously defined.

The signature schemes are very specific mathematical statements, or **circuit**. With `gnark`, one can in fact write any mathematical statement using the gnark API. An instance of such a mathematical statement is Hash(x)==y, where y is public and x private. A valid proof of such a statement ensures that the creator of the proof knows x such that Hash(x)=y, without revealing x.

ZK-SNARK is a very active area of academic research with improvments and new protocols announced week-by-week.  For example, according to [this overview article](https://nakamoto.com/cambrian-explosion-of-crypto-proofs/) we saw the following new ZKP protocols in 2019: Libra, Sonic, SuperSonic, PLONK, SLONK, Halo, Marlin, Fractal, Spartan, Succinct Aurora, RedShift, AirAssembly.

There are many good expositions of ZK-SNARKs. We recommend [this explainer](https://z.cash/technology/zksnarks/) by the fine people behind ZCash and [this curated list of references](https://github.com/matter-labs/awesome-zero-knowledge-proofs).