import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import { Subject } from 'rxjs'

export type ShutdownListener = () => PromiseLike<void>

@Injectable()
export default class ShutdownService implements OnModuleDestroy {
  private shutdownListener: ShutdownListener[] = []

  async onModuleDestroy() {
    await Promise.all(this.shutdownListener.map(it => it()))
  }

  subscribeToShutdown(shutdown: ShutdownListener): void {
    this.shutdownListener.push(shutdown)
  }
}
