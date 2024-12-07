import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, Logger } from "@nestjs/common";
import V2ApiClient, { TagInfo, V2ApiClientOptions } from "./v2-api.client";
import { Cache } from "cache-manager";

@Injectable()
export default class V2ManifestClient {
  private readonly logger = new Logger(V2ManifestClient.name)

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

  async fetchLabels(image: string, tag: string, clientOptions: V2ApiClientOptions): Promise<Record<string, string>> {
    const client = new V2ApiClient(clientOptions, this.cacheManager);
    
    return client.fetchLabels(image, tag);
  }

  async fetchTagInfo(image: string, tag: string, clientOptions: V2ApiClientOptions): Promise<TagInfo> {
    const client = new V2ApiClient(clientOptions, this.cacheManager);
    
    return client.fetchTagInfo(image, tag);
  }
}