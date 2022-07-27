declare namespace NodeJS {
  export interface Global {
    _registryConnections: RegistryConnections | undefined
    _crux: CruxClients | undefined
    _serviceStatus: DyoServiceStatusCheckers | undefined
  }
}
