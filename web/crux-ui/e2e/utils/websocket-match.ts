export const wsPatchMatchPorts = (internalPort: string, externalPort: string) => (payload: any) => {
  const internal = Number.parseInt(internalPort, 10)
  const external = Number.parseInt(externalPort, 10)

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

export const wsPatchMatchSecret = (secret: string, required: boolean) => (payload: any) => {
  return payload.config?.secrets?.some(it => it.key === secret && it.required === required)
}

export const wsPatchMatchCommand = (command: string) => (payload: any) => {
  return payload.config?.commands?.some(it => it.key === command)
}

export const wsPatchMatchArgument = (argument: string) => (payload: any) => {
  return payload.config?.args?.some(it => it.key === argument)
}

export const wsPatchMatchRouting =
  (domain: string, path: string, uploadLimit: string, stripPath: boolean) => (payload: any) => {
    let routing = payload.config?.routing
    return (
      routing?.uploadLimit === uploadLimit &&
      routing?.domain === domain &&
      routing?.path === path &&
      routing?.stripPath === stripPath
    )
  }

export const wsPatchMatchContainerName = (name: string) => (payload: any) => {
  return payload.config?.name === name
}

export const wsPatchMatchUser = (user: number) => (payload: any) => {
  return payload.config?.user === user
}

export const wsPatchMatchExpose = (expose: string) => (payload: any) => {
  return payload.config?.expose === expose
}

export const wsPatchMatchTTY = (tty: boolean) => (payload: any) => {
  return payload.config?.tty === tty
}

export const wsPatchMatchEnvironment = (key: string, value: string) => (payload: any) => {
  return payload.config?.environment?.some(it => it.key === key && it.value === value)
}

export const wsPatchMatchConfigContainer =
  (image: string, volume: string, path: string, keepFiles: boolean) => (payload: any) => {
    let conf = payload.config?.configContainer
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
  (payload: any) => {
    return payload.config?.initContainers?.some(
      it =>
        it.name === name &&
        it.image === image &&
        it.volumes?.some(vol => vol.name === volName && vol.path === volPath) &&
        it.args?.some(args => args.key === arg) &&
        it.command?.some(cmds => cmds.key === cmd) &&
        it.environment?.some(env => env.key === envKey && env.value === envVal),
    )
  }

export const wsPatchMatchVolume = (name: string, size: string, path: string, volClass: string) => (payload: any) => {
  return payload.config?.volumes?.some(
    it => it.name === name && it.path === path && it.size === size && it.class === volClass,
  )
}

export const wsPatchMatchStorage = (storageId: string, bucketPath: string, volume: string) => (payload: any) => {
  let storage = payload.config?.storage
  return storage?.storageId === storageId && storage?.bucket === bucketPath && storage?.path === volume
}

export const wsPatchMatchLogConfig = (driver: string, key: string, value: string) => (payload: any) => {
  return (
    payload.config?.logConfig?.driver === driver &&
    payload.config?.logConfig?.options?.some(opts => opts.key === key && opts.value === value)
  )
}

export const wsPatchMatchRestartPolicy = (policy: string) => (payload: any) => {
  return payload.config?.restartPolicy === policy
}

export const wsPatchMatchNetworkMode = (mode: string) => (payload: any) => {
  return payload.config?.networkMode === mode
}

export const wsPatchMatchNetwork = (network: string) => (payload: any) => {
  return payload.config?.networks?.some(it => it.key === network)
}

export const wsPatchMatchDockerLabel = (key: string, value: string) => (payload: any) => {
  return payload.config?.dockerLabels?.some(it => it.key === key && it.value === value)
}

export const wsPatchMatchDeploymentStrategy = (strategy: string) => (payload: any) => {
  return payload.config?.deploymentStrategy === strategy
}

export const wsPatchMatchCustomHeader = (header: string) => (payload: any) => {
  return payload.config?.customHeaders?.some(it => it.key === header)
}

export const wsPatchMatchProxyHeader = (proxy: boolean) => (payload: any) => {
  return payload.config?.proxyHeaders === proxy
}

export const wsPatchMatchLoadBalancer = (loadbalancer: boolean) => (payload: any) => {
  return payload.config?.useLoadBalancer === loadbalancer
}

export const wsPatchMatchLBAnnotations = (key: string, value: string) => (payload: any) => {
  return payload.config?.extraLBAnnotations?.some(it => it.key === key && it.value === value)
}

export const wsPatchMatchHealthCheck =
  (port: number, liveness: string, readiness: string, startup: string) => (payload: any) => {
    let hc = payload.config?.healthCheckConfig
    return (
      hc?.port === port &&
      hc?.livenessProbe === liveness &&
      hc?.readinessProbe === readiness &&
      hc?.startupProbe === startup
    )
  }

export const wsPatchMatchResourceConfig =
  (cpuLimits: string, cpuRequests: string, memoryLimits: string, memoryRequests: string) => (payload: any) => {
    let rsrc = payload.config?.resourceConfig
    return (
      rsrc?.limits?.cpu === cpuLimits &&
      rsrc?.limits?.memory === memoryLimits &&
      rsrc?.requests?.cpu === cpuRequests &&
      rsrc?.requests?.memory === memoryRequests
    )
  }

export const wsPatchMatchDeploymentLabel = (key: string, value: string) => (payload: any) => {
  return payload.config?.labels?.deployment?.some(it => it.key === key && it.value === value)
}
export const wsPatchMatchServiceLabel = (key: string, value: string) => (payload: any) => {
  return payload.config?.labels?.service?.some(it => it.key === key && it.value === value)
}
export const wsPatchMatchIngressLabel = (key: string, value: string) => (payload: any) => {
  return payload.config?.labels?.ingress?.some(it => it.key === key && it.value === value)
}

export const wsPatchMatchDeploymentAnnotations = (key: string, value: string) => (payload: any) => {
  return payload.config?.annotations?.deployment?.some(it => it.key === key && it.value === value)
}
export const wsPatchMatchServiceAnnotations = (key: string, value: string) => (payload: any) => {
  return payload.config?.annotations?.service?.some(it => it.key === key && it.value === value)
}
export const wsPatchMatchIngressAnnotations = (key: string, value: string) => (payload: any) => {
  return payload.config?.annotations?.ingress?.some(it => it.key === key && it.value === value)
}
