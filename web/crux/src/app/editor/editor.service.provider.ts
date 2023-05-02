import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import EditorService from './editor.service'

@Injectable()
export default class EditorServiceProvider implements OnModuleDestroy {
  private services: Map<string, EditorService> = new Map()

  constructor(private moduleRef: ModuleRef) {}

  onModuleDestroy() {
    this.services.clear()
  }

  async getService(entityId: string): Promise<EditorService | null> {
    const service = this.services.get(entityId)
    return service ?? null
  }

  async getOrCreateService(entityId: string): Promise<EditorService> {
    let service = this.services.get(entityId)
    if (!service) {
      service = await this.moduleRef.resolve(EditorService)
      this.services.set(entityId, service)
    }

    return service
  }

  free(entityId: string) {
    const service = this.services.get(entityId)
    if (!service) {
      return
    }

    this.services.delete(entityId)
  }
}
