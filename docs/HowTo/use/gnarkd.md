---
description: gnarkd, a gnark proving and verifying server
---

# `gnarkd`: a `gnark` proving and verifying server 

!!! warning
    `gnarkd` is experimental and might not stay in `gnark` main repository in the future

For multiple reasons (resource allocation, security, architecture ...) it may be useful to isolate `gnark` as a service.

We provide a minimalist daemon, `gnarkd`, which exposes synchronous and asynchronous gRPC APIs to create and verify proofs. 

## Starting `gnarkd` 

```bash
cd gnark/gnarkd
go build
./gnarkd
```

or through a Docker image

```bash
cd gnark/gnarkd
docker build -f gnarkd/Dockerfile.example -t gnarkd .
docker run -it --rm  -p9002:9002 -p9001:9001 --mount type=bind,source="$(pwd)"/circuits,target=/root/circuits --mount type=bind,source="$(pwd)"/certs,target=/root/certs gnarkd:latest
```

When `gnarkd` starts, it loads the circuits defined in `circuits/` folder.

Circuits must be stored in a separate folder, under a curve subfolder.

!!!example
    `circuits/bn254/cubic` will contain `cubic.pk`, `cubic.vk` and `cubic.r1cs`

    `circuitID` (as needed in the APIs) is then `bn254/cubic` 

`gnarkd` listens on 2 distinct TCP connections: one for gRPC, one for receiving large witnesses on async calls.

On this second connection, the server expects: `jobID` | `witness` 

* `jobID` is returned by `CreateProveJob` and is a standard UUID (RFC 4122) on 16 byte (server impl uses `github.com/google/uuid`)
* `gnarkd` knows which witness size to expect (via `r1cs.GetNbPublicWires`, `r1cs.GetNbSecretWires` and `r1cs.SizeFrElement`)



## APIs

Refer to [gnark/gnarkd/pb/gnarkd.proto]() for up to date APIs.

## Generating SDKs

gRPC clients can be generated for multiple languages (Go, Rust, ...) see `protoc` doc for more info. 
For Go: 

```bash
protoc --experimental_allow_proto3_optional --go_out=. --go_opt=paths=source_relative --go-grpc_out=. --go-grpc_opt=paths=source_relative  pb/gnarkd.proto
```

## Example client (Go)

See [gnark/gnarkd/client/example.go](). 