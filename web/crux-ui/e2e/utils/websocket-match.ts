import { UniqueSecretKeyValue } from '@app/models'

export const wsPatchMatchPorts = (internalPort: string, externalPort?: string) => (payload: any) => {
  const internal = Number.parseInt(internalPort, 10)
  const external = externalPort ? Number.parseInt(externalPort, 10) : null

  return payload.config?.ports?.some(it => it.internal === internal && it.external === external)
}

export const wsPatchMatchPortRange =
  (internalFromPort: string, externalFromPort: string, internalToPort: string, externalToPort: string) =>
  (payload: any) => {
    const internal = Number.parseInt(internalFromPort, 10)
    const external = Number.parseInt(externalFromPort, 10)
    const internalTo = Number.parseInt(internalToPort, 10)
    const externalTo = Number.parseInt(externalToPort, 10)

    return payload.config?.portRanges?.some(
      it =>
        it.internal.from === internal &&
        it.external.from === external &&
        it.internal.to === internalTo &&
        it.external.to === externalTo,
    )
  }

export const wsPatchMatchEverySecret =
  (secretKeys: string[]) =>
  (payload: any): boolean => {
    const payloadSecretKeys: string[] = payload.config?.secrets?.map(it => it?.key) ?? []
    return secretKeys.every(it => payloadSecretKeys.includes(it))
  }

export const wsPatchMatchNonNullSecretValues =
  (secretKeys: string[]) =>
  (payload: any): boolean => {
    const payloadSecrets: UniqueSecretKeyValue[] = payload.config?.secrets ?? []

    return (
      secretKeys.every(secKey => payloadSecrets.find(it => it.key === secKey)) &&
      payloadSecrets.every(it => typeof it.value === 'string')
    )
  }

export const wsPatchMatchSecret = (secret: string, required: boolean) => (payload: any) =>
  payload.config?.secrets?.some(it => it.key === secret && it.required === required)

export const wsPatchMatchCommand = (command: string) => (payload: any) =>
  payload.config?.commands?.some(it => it.key === command)

export const wsPatchMatchArgument = (argument: string) => (payload: any) =>
  payload.config?.args?.some(it => it.key === argument)

export const wsPatchMatchRouting =
  (domain: string, path: string, uploadLimit: string, stripPath: boolean, port: number) => (payload: any) => {
    const routing = payload.config?.routing
    return (
      routing?.uploadLimit === uploadLimit &&
      routing?.domain === domain &&
      routing?.path === path &&
      routing?.stripPath === stripPath &&
      routing?.port === port
    )
  }

export const wsPatchMatchContainerName = (name: string) => (payload: any) => payload.config?.name === name

export const wsPatchMatchUser = (user: number) => (payload: any) => payload.config?.user === user

export const wsPatchMatchExpose = (expose: string) => (payload: any) => payload.config?.expose === expose

export const wsPatchMatchTTY = (tty: boolean) => (payload: any) => payload.config?.tty === tty

export const wsPatchMatchEnvironment = (key: string, value: string) => (payload: any) =>
  payload.config?.environment?.some(it => it.key === key && it.value === value)

export const wsPatchMatchConfigContainer =
  (image: string, volume: string, path: string, keepFiles: boolean) => (payload: any) => {
    const conf = payload.config?.configContainer
    return conf?.image === image && conf?.volume === volume && conf?.path === path && conf?.keepFiles === keepFiles
  }

export const wsPatchMatchInitContainer =
  (
    name: string,
    image: string,
    volName: string,
    volPath: string,
    arg: string,
    cmd: string,
    envKey: string,
    envVal: string,
  ) =>
  (payload: any) =>
    payload.config?.initContainers?.some(
      it =>
        it.name === name &&
        it.image === image &&
        it.volumes?.some(vol => vol.name === volName && vol.path === volPath) &&
        it.args?.some(args => args.key === arg) &&
        it.command?.some(cmds => cmds.key === cmd) &&
        it.environment?.some(env => env.key === envKey && env.value === envVal),
    )

export const wsPatchMatchVolume = (name: string, size: string, path: string, volClass: string) => (payload: any) =>
  payload.config?.volumes?.some(it => it.name === name && it.path === path && it.size === size && it.class === volClass)

export const wsPatchMatchStorage = (storageId: string, bucketPath: string, volume: string) => (payload: any) => {
  const storage = payload.config?.storage
  return storage?.storageId === storageId && storage?.bucket === bucketPath && storage?.path === volume
}

export const wsPatchMatchLogConfig = (driver: string, key: string, value: string) => (payload: any) =>
  payload.config?.logConfig?.driver === driver &&
  payload.config?.logConfig?.options?.some(opts => opts.key === key && opts.value === value)

export const wsPatchMatchRestartPolicy = (policy: string) => (payload: any) => payload.config?.restartPolicy === policy

export const wsPatchMatchNetworkMode = (mode: string) => (payload: any) => payload.config?.networkMode === mode

export const wsPatchMatchNetwork = (network: string) => (payload: any) =>
  payload.config?.networks?.some(it => it.key === network)

export const wsPatchMatchDockerLabel = (key: string, value: string) => (payload: any) =>
  payload.config?.dockerLabels?.some(it => it.key === key && it.value === value)

export const wsPatchMatchDeploymentStrategy = (strategy: string) => (payload: any) =>
  payload.config?.deploymentStrategy === strategy

export const wsPatchMatchCustomHeader = (header: string) => (payload: any) =>
  payload.config?.customHeaders?.some(it => it.key === header)

export const wsPatchMatchProxyHeader = (proxy: boolean) => (payload: any) => payload.config?.proxyHeaders === proxy

export const wsPatchMatchLoadBalancer = (loadbalancer: boolean) => (payload: any) =>
  payload.config?.useLoadBalancer === loadbalancer

export const wsPatchMatchLBAnnotations = (key: string, value: string) => (payload: any) =>
  payload.config?.extraLBAnnotations?.some(it => it.key === key && it.value === value)

export const wsPatchMatchHealthCheck =
  (port: number, liveness: string, readiness: string, startup: string) => (payload: any) => {
    const hc = payload.config?.healthCheckConfig
    return (
      hc?.port === port &&
      hc?.livenessProbe === liveness &&
      hc?.readinessProbe === readiness &&
      hc?.startupProbe === startup
    )
  }

export const wsPatchMatchResourceConfig =
  (cpuLimits: string, cpuRequests: string, memoryLimits: string, memoryRequests: string) => (payload: any) => {
    const rsrc = payload.config?.resourceConfig
    return (
      rsrc?.limits?.cpu === cpuLimits &&
      rsrc?.limits?.memory === memoryLimits &&
      rsrc?.requests?.cpu === cpuRequests &&
      rsrc?.requests?.memory === memoryRequests
    )
  }

export const wsPatchMatchDeploymentLabel = (key: string, value: string) => (payload: any) =>
  payload.config?.labels?.deployment?.some(it => it.key === key && it.value === value)
export const wsPatchMatchServiceLabel = (key: string, value: string) => (payload: any) =>
  payload.config?.labels?.service?.some(it => it.key === key && it.value === value)
export const wsPatchMatchIngressLabel = (key: string, value: string) => (payload: any) =>
  payload.config?.labels?.ingress?.some(it => it.key === key && it.value === value)

export const wsPatchMatchDeploymentAnnotations = (key: string, value: string) => (payload: any) =>
  payload.config?.annotations?.deployment?.some(it => it.key === key && it.value === value)
export const wsPatchMatchServiceAnnotations = (key: string, value: string) => (payload: any) =>
  payload.config?.annotations?.service?.some(it => it.key === key && it.value === value)
export const wsPatchMatchIngressAnnotations = (key: string, value: string) => (payload: any) =>
  payload.config?.annotations?.ingress?.some(it => it.key === key && it.value === value)
