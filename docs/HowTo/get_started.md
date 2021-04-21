---
description: Add gnark to your project
---

# Add gnark to your project

## Prerequisites

- [Install Go](https://golang.org/doc/install).

## Install `gnark`

`gnark` is a standard Go module, install it using the following command inside your Go module:

```bash
go get github.com/consensys/gnark@{{content_vars.gnark_version}}
```

!!! note

    If you use Go modules, in `go.mod` the module path is case sensitive
    (use `consensys` and not `ConsenSys`).

!!! info
    `gnark` is optimized for `amd64` targets (`x86 64bits`) and tested on Unix (Linux / macOS).
