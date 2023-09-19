# Development resources

The internal details of dyrector.io's components.

## Agent versioning

Crux considers two things to determine if an agent is outdated:
 - The `AGENT_PROTO_COMPATIBILITY_MINIMUM_VERSION` in the `web/crux/shared/const.ts` file
 - And the version number in Crux's `package.json`

When the agent version is between `AGENT_PROTO_COMPATIBILITY_MINIMUM_VERSION` and the `package.json`'s version
the agent's status will be connected, and it will be fully functional. Otherwise it going to be outdated,
and can not be used unless an update is performed.

### Releasing a new agent
While creating a new release, the `AGENT_PROTO_COMPATIBILITY_MINIMUM_VERSION` should be incremented to the version number of the new release when:
 - The agent proto changed in a way that is incompatible with the old agents
 - The internal working of the agent changed in a way that is incompatible with the new Crux

## Container labels

Each container in the dyrector.io stack has an `org.dyrectorio.service-category` label. When `org.dyrectorio.service-category`:`_internal`, the running containers of dyrector.io stack will be hidden from Docker Desktop UI and other tools.
