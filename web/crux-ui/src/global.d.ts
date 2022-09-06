declare namespace NodeJS {
  export interface Global {
    registryConnections: RegistryConnections | undefined
    crux: CruxClients | undefined
    serviceStatus: DyoServiceStatusCheckers | undefined
  }
}
