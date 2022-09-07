import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import { Subject } from 'rxjs'

@Injectable()
export default class ShutdownService implements OnModuleDestroy {
  private readonly logger = new Logger(ShutdownService.name)

  private shutdownListener: Subject<void> = new Subject()

  onModuleDestroy() {
    this.logger.verbose('Executing OnDestroy Hook.')
  }

  subscribeToShutdown(shutdown: () => void): void {
    this.shutdownListener.subscribe(() => shutdown())
  }

  shutdown() {
    this.shutdownListener.next()
  }
}
