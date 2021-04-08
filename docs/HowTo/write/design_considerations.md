---
description: gnark circuits design considerations
---

TODO maybe extract this section under HowTo/PickAZKPScheme ?
# Proving scheme and curve choice 

Picking the right proving scheme and elliptic curve is balancing the following tradeoffs and constraints:

`Groth16` (aka zkSNARKs):

+ Short proofs
+ Fast proving time
- Trusted setup

TODO 

Curves impact security, performance. Not always available, for example Ethereum mainnet == BN254. TODO. 

# Circuit design considerations 

Before jumping into [`gnark` API](write_circuit.md), we highlight that, some algorithms are more natural than others in the "circuit world". 

Some operations like `Div` which are expensive in a non-circuit arithmetic, are free.. (TODO)

... TODO 