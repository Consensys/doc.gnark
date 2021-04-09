---
description: gnark circuit development workflow
---

# Workflow

{!HowTo/checkout_concepts.md!}
  
In a typical workflow, one starts with an algorithm -- for which we want to prove and verify its execution.

This is done in the following steps:

1. [Implement the algorithm using `gnark` API](../write/circuit_api.md)
2. [Compile the circuit using `gnark/frontend` package](../compile.md)
3. [Use the `groth16/backend` package to create and verify proofs](../prove.md)
   
    --> Run a one-time `Setup` for the circuit, which outputs cryptographic keys  

    --> Run the `Prove` algorithm to create a `Proof`

    --> Run the `Verify` algorithm to verify the `Proof`
