---
description: Proving schemes and curves
---

`gnark` supports two proving schemes [Groth16](https://eprint.iacr.org/2016/260.pdf) and [PlonK](https://eprint.iacr.org/2019/953.pdf) that can be instantiated with any of the following four elliptic curves: *BN254*, *BLS12-381*, *BLS12-377* or *BW6-761*. An ID is supplied to `gnark` to conveniently choose the proving scheme and the instantiating curve.

## Which proving system should I choose for my application?

### Groth16

Groth16 is a circuit-specific preprocessing general-purpose zk-SNARK construction introduced by Jens Groth in 2016. It has become since a de-facto standard used in several blockchain projects due to the constant size of its proof and its appealing verifier time. On the downside, Groth16 needs a circuit-specific trusted setup for its preprocessing phase. Beside the [paper](http://www.zeroknowledgeblog.com/index.php/groth16), we recommend this short and good [explainer](http://www.zeroknowledgeblog.com/index.php/groth16).

!!!info
    Some projects that use Groth16: *ZCash, Loopring, Hermez, Celo, Filecoin…*

### PlonK

PlonK is a universal preprocessing general-purpose zk-SNARK construction introduced by A. Gabizon, Z. Williamson and O. Ciobotaru in 2019. It is a recent proving scheme that tracted a lot of attention in several blockchain projects due to its universal and updatable preprocessing phase and its relatively short and constant verifier time. On the downside, PlonK proofs are relatively bigger and slower to generate compared to Groth16. Beside the [paper](https://eprint.iacr.org/2019/953.pdf), we recommend this good [explainer](https://hackmd.io/@zkteam/plonk).

!!!note
    PlonK comes in different flavours according to the chosen polynomial commitment scheme (e.g. [KZG](https://www.iacr.org/archive/asiacrypt2010/6477178/6477178.pdf), [Pedersen-Bulletproofs](http://web.stanford.edu/~buenz/pubs/bulletproofs.pdf), [FRI-based](https://eprint.iacr.org/2019/1020.pdf), [DARK](https://eprint.iacr.org/2019/1229.pdf)), the prover/verifier tradeoff (e.g. "fast-prover-but-slow-verifier" or "slow-prover-but-fast-verifier" settings) and different optimizations (e.g. [TurboPlonK](https://docs.zkproof.org/pages/standards/accepted-workshop3/proposal-turbo_plonk.pdf), [Plookup](https://eprint.iacr.org/2020/315.pdf)). Currently, `gnark` supports PlonK with KZG polynomial commitment.

!!!info
    Some projects that use PlonK: *Aztec, ZKSync, Dusk.*

**TL;DR**

|                  | Groth16           | PlonK                  |
|------------------|-------------------|------------------------|
|trusted[^1] setup | circuit-specific  | universal :star::star: |
|proof length      | :star::star::star:| :star:                 |
|prover work       | :star::star:      | :star:                 |
|verifier work     | :star::star:      | :star:                 |

Groth16 is best suited when an application needs to generate many proofs for the same circuit (e.g. a single logic computation) and performance is critical while PlonK is best suited when it needs to handle many different circuits (e.g. different arbitrary buisiness logics) with reasonably fast performance.

[^1]: PlonK setup can be made trustless if used with FRI-based or DARK (class groups or Jacobians of genus 2 (or 3) curves) polynomial commitment. Currently, `gnark` supports only KZG scheme.

## Which elliptic curve should I choose for my application?

Both Groth16 and PlonK (with KZG scheme) need to be instantiated with an elliptic curve. `gnark` supports four elliptic curves: *BN254*, *BLS12-381*, *BLS12-377* and *BW6-761*. All these curves are defined over a finite field $\mathbb{F}_p$ and have an equation of the form $y^2=x^3+b$ ($b\in \mathbb{F}_p$). To work with Groth16 and PlonK, they additionally are:

- [x] secure (for proof soundness)
- [x] pairing-friendly (for proof verification)
- [x] and have a highly 2-adic subgroup order (for efficient proof generation)

!!!info
    `BN254` is used in Ethereum 1.x,
    `BLS12-381` in Ethereum 2.0, ZCash Sapling, Algorand, Dfinity, Chia, Filecoin...,
    and `BLS12-377/BW6-761` in Celo, Aleo and EY.

### `BN254` or `BLS1-381`?

For applications that target Ethereum 1.x mainnet, `BN254` is the only supported curve through precompiles (EIPs for other curves exist but are not integrated yet: [EIP-2539](https://eips.ethereum.org/EIPS/eip-2539), [EIP2537](https://eips.ethereum.org/EIPS/eip-2537) and [EIP-3026](https://eips.ethereum.org/EIPS/eip-3026)). For applications that target Ethereum 2.0, BLS12-381 is the go-to curve. For platform-agnostic applications, the choice requires a tradeoff between performance (BN254) and security (BLS12-381). We recommend choosing BLS12-381 as it offers a conservatively more secure and still fast instantiation of zk-SNARKs.

### What about `BLS12-377` and `BW6-761`?

Applications that require one-layer proof composition (a proof of proofs) cannot use BN254 or BLS12-381 as they are quite inefficient for this purpose. In fact, such an application needs a pair ($E_1, E_2$) of elliptic curves that are both:

- [x] secure (for proof soundness)
- [x] pairing-friendly (for proof verification)
- [x] have a highly 2-adic subgroup order (for efficient proof generation)

    and

- [x] $E_2$ has a subgroup order equal to $E_1$'s field characteristic (for efficient proof composition)

(BLS12-377, BW6-761) pair of curves satisfies these conditions while enjoying fast implementations.

!!!note
    Given the last condition, $E_1$ must have a highly 2-adic field characteristic. Hence, BLS12-381 cannot be used.

!!!info
    Some [benchmarks and comparisons](https://hackmd.io/@zkteam/eccbench) of third-parties implementations against `gnark-crypto`.

!!!info
    Some applications that use one-layer proof composition: *ZEXE, Celo, Aleo, Zecale.*
