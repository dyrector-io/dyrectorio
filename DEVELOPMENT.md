# Development resources

The internal details of `dyrector.io`'s components.

## Agent versioning

Agent is a service that can be installed in your Kubernetes cluster or VPS to communicate with the dyrector.io platform. `crux` considers two things to determine if an agent is outdated:

-   `AGENT_PROTO_COMPATIBILITY_MINIMUM_VERSION` in the [web/crux/src/const.ts](./web/crux/src/shared/const.ts) file
-   the version number in [crux's package.json](./web/crux/package.json)

When the agent version is between `AGENT_PROTO_COMPATIBILITY_MINIMUM_VERSION` and the `package.json`'s version the agent's status will be connected, and it will be fully functional. Otherwise, it will be considered outdated and, while still usable, some functionalities may not work properly until it is updated.

### Releasing a new agent

While creating a new release, the `AGENT_PROTO_COMPATIBILITY_MINIMUM_VERSION` should be incremented to the version number of the new release when:

-   The agent proto changed in a way that is incompatible with the old agents
-   The internal working of the agent changed in a way that is incompatible with the new Crux

## Container labels

##### `org.dyrectorio.service-category`

Hide containers within your dyrector.io platform.

Each container in the dyrector.io stack has an `org.dyrectorio.service-category` label. When `org.dyrectorio.service-category` is set to `_internal`, these containers will not be listed on the Node screen within the dyrector.io platform.
