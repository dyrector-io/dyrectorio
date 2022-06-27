# dyrector.io container labels

dyo loco

dyrector.io +

Labels On COntainers

d8o.io

Two types:

- capabilities
- needs

These appear as labels on containers eg:

```sh
LABEL "io.dyrector.cap.serve.80" "false,tcp"
LABEL "io.dyrector.cap.serve.50000-50100" "false,tcp"

```

## Capability

| Instruction            | Param description | Default     |
| ---------------------- | ----------------- | ----------- |
| serve.< `port` >       | _public_,_port_   | `false,tcp` |
| serve.< `port-range` > | _public_,_port_   | `false,tcp` |

## Needs

| Instruction | Expected outcome |
| ----------- | ---------------- |
| Item1       | Item1            |
