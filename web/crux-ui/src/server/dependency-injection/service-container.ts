export type ServiceInitializer = (services: ServiceContainer) => object
export type TypeOf<T> = Function & {
  new (...args: any[]): T
}

class ServiceContainer {
  private initializers: Map<string, ServiceInitializer> = new Map()

  private services: Map<string, any> = new Map()

  get<T>(type: TypeOf<T>): T {
    const { name } = type

    let srv = this.services.get(name)

    if (srv) {
      return srv as T
    }

    const init = this.initializers.get(name)
    if (!init) {
      return null
    }

    srv = init(this)
    this.services.set(name, srv)

    return srv as T
  }

  register(type: Function, initialzer: ServiceInitializer) {
    const { name } = type

    if (this.initializers.has(name)) {
      throw Error(`ServiceContainer error: ${name} is already registered`)
    }

    this.initializers.set(name, initialzer)
  }
}

export default ServiceContainer
