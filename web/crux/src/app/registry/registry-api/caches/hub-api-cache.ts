type CacheEntry = {
  createdAt: number
  data: any
}

class HubApiCache {
  constructor(private expirationMillis: number) {}

  private entries: Map<string, CacheEntry> = new Map()

  public clients = 1

  get(url: string) {
    const now = new Date().getTime()

    const entry = this.entries.get(url)

    if (!entry) {
      return null
    }

    if (now - entry.createdAt >= this.expirationMillis) {
      this.entries.delete(url)
      return null
    }

    return entry.data
  }

  upsert(url: string, data: any) {
    this.entries.set(url, {
      createdAt: new Date().getTime(),
      data,
    })
  }
}

export default HubApiCache
