class Mutex {
  private lock = Promise.resolve()

  async aquire(): Promise<VoidFunction> {
    await this.lock

    let free: VoidFunction = null

    this.lock = new Promise(resolve => {
      free = resolve
    })

    return () => free()
  }
}

export default Mutex
