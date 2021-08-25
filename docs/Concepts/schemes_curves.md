---
description: Proving schemes and curves
---

# Prove schemes and curves

`gnark` supports two proving schemes [Groth16](https://eprint.iacr.org/2016/260.pdf) and
[PlonK](https://eprint.iacr.org/2019/953.pdf). These schemes can be instantiated with any of the
following four elliptic curves: *BN254*, *BLS12-381*, *BLS12-377* or *BW6-761*.

An ID is supplied to `gnark` to choose the proving scheme and the instantiating curve.

## Choosing a proving system

!!! info "Quick system guide"

    |                  | Groth16           | PlonK                  |
    |------------------|-------------------|------------------------|
    |trusted[^1] setup | circuit-specific  | universal :star::star: |
    |proof length      | :star::star::star:| :star:                 |
    |prover work       | :star::star:      | :star:                 |
    |verifier work     | :star::star:      | :star:                 |

    Groth16 is best suited when an application needs to generate many proofs for the same circuit
    (for instance a single logic computation) and performance is critical, while PlonK is best
    suited when it needs to handle many different circuits
    (for example different arbitrary business logics) with reasonably fast performance.

### Groth16

Groth16 is a circuit-specific preprocessing general-purpose zk-SNARK construction. It has become
a de-facto standard used in several blockchain projects due to the constant size of its proof, and
its appealing verifier time. On the downside, Groth16 needs a circuit-specific trusted setup for its
preprocessing phase.

!!! info

    We recommend this short [explaination of Groth16](http://www.zeroknowledgeblog.com/index.php/groth16).

    Some projects that use Groth16 include ZCash, Loopring, Hermez, Celo, and Filecoin.

### PlonK

PlonK is a universal preprocessing general-purpose zk-SNARK construction.

It's a proving scheme with a preprocessing phase that can be updated, and has a short and
constant verification time. On the downside, PlonK proofs are bigger and slower to generate compared
to Groth16.

!!! info

    For more information, we recommend this [Plonk paper](https://eprint.iacr.org/2019/953.pdf), and
    [this Plonk article](https://hackmd.io/@zkteam/plonk).

    Some projects that use PlonK include Aztec, ZKSync, and Dusk.

!!! note

    PlonK comes in different version according to the chosen polynomial commitment scheme.
    For example:

    - [KZG](https://www.iacr.org/archive/asiacrypt2010/6477178/6477178.pdf)
    - [Pedersen-Bulletproofs](http://web.stanford.edu/~buenz/pubs/bulletproofs.pdf)
    - [FRI-based](https://eprint.iacr.org/2019/1020.pdf)
    - [DARK](https://eprint.iacr.org/2019/1229.pdf)

    There are also versions for the prover/verifier tradeoff. For example
    "fast-prover-but-slow-verifier" or "slow-prover-but-fast-verifier" settings.

    There are also different optimizations. For example:

    - [TurboPlonK](https://docs.zkproof.org/pages/standards/accepted-workshop3/proposal-turbo_plonk.pdf),
    - [Plookup](https://eprint.iacr.org/2020/315.pdf)).

    Currently, `gnark` supports PlonK with KZG polynomial commitment.

## Choosing an elliptic curve

Both Groth16 and PlonK (with KZG scheme) need to be instantiated with an elliptic curve.
`gnark` supports six elliptic curves: BN254, BLS12-381, BLS12-377, BW6-761, BLS24-315, and BW6-633.
All these curves are defined over a finite field $\mathbb{F}_p$ and have an equation of the form
$y^2=x^3+b$ ($b\in \mathbb{F}_p$).

To work with Groth16 and PlonK, the curves must:

- Be secure, for proof soundness
- Be pairing-friendly, for proof verification
- Have a highly 2-adic subgroup order, for efficient proof generation.

!!! info

    BN254 is used in Ethereum 1.x,
    BLS12-381 in Ethereum 2.0, ZCash Sapling, Algorand, Dfinity, Chia, and Filecoin,
    and BLS12-377/BW6-761 in Celo, Aleo and EY.

### BN254 and BLS12-381 curves

For applications that target Ethereum 1.x mainnet, BN254 is the only supported curve. EIPs for other
curves exist but are not integrated yet:

- [`EIP-2539`](https://eips.ethereum.org/EIPS/eip-2539)
- [`EIP-2537`](https://eips.ethereum.org/EIPS/eip-2537)
- [`EIP-3026`](https://eips.ethereum.org/EIPS/eip-3026).

For applications that target Ethereum 2.0, use BLS12-381.

For platform-agnostic applications, the choice requires a tradeoff between performance
(BN254) and security (BLS12-381). We recommend choosing BLS12-381 as it is more secure, still fast
enough to be practical, but slower than BN254.

### BLS12-377 and BW6-761 curves

Applications that require one-layer proof composition (a proof of proofs) cannot use BN254 or
BLS12-381 as they are quite inefficient for this purpose.

In fact, such an application needs a pair ($E_1, E_2$) of elliptic curves that:

- Are secure, for proof soundness
- Are pairing-friendly, for proof verification
- Have a highly 2-adic subgroup order, for efficient proof generation.
- $E_2$ has a subgroup order equal to $E_1$'s field characteristic, for efficient proof composition.

BLS12-377 and BW6-761 curves satisfy these conditions, while having fast implementations.

!!! note

    Given $E_1$ must have a highly 2-adic field characteristic, BLS12-381 cannot be used.

!!! info

    Some [benchmarks and comparisons](https://hackmd.io/@zkteam/eccbench) of third-parties
    implementations against `gnark-crypto`.

    Some applications that use one-layer proof composition include ZEXE, Celo, Aleo, and Zecale.

### BLS24-315 and BW6-633 curves

In Groth16, elliptic curve operations take place in three different groups: $G_1$, $G_2$ and $G_T$, whereas in
PlonK (with KZG) operations take place only in $G_1$ and $G_T$. While BN254, BLS12-381 and BLS12-377 are optimized
for all the three groups, BLS24-315 is better optimized for $G_1$ only while still competitively optimized for $G_T$.
Moreover, it comes in a 2-chain setting with BW6-633 to enable PlonK one-layer proof composition efficiently.

In summary, (BLS24-315, BW6-633) is a pair of elliptic curves that:

- Are secure, for proof soundness.
- Are pairing-friendly, for proof verification.
- Are optimized for KZG-based SNARKs (for example, PlonK).
- Have a highly 2-adic subgroup order, for efficient proof generation.
- For efficient proof composition, BW6-633 has a subgroup order equal to BLS24-315's field characteristic.
