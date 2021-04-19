---
description: Add gnark to your project
---

# Add gnark to your project

## Prerequisites

You'll need to [install Go](https://golang.org/doc/install).

## Install `gnark`

`gnark` is a standard Go module. Simply execute:

```bash
go get github.com/consensys/gnark@{{gnark_version}}
```

!!!note
    If you use go modules, in `go.mod` the module path is case sensitive (use `consensys` and not `ConsenSys`).

!!! info
    `gnark` is optimized for `amd64` targets (x86 64bits) and tested on Unix (Linux / macOS).
