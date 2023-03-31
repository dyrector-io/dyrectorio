export type BasicStorage = {
  id: string
  name: string
}

export type Storage = BasicStorage & {
  description?: string
  icon?: string
  url: string
}

export type StorageDetails = Storage & {
  accessKey?: string
  secretKey?: string
  inUse: boolean
}

export type CreateStorage = Omit<Storage, 'id' | 'inUse'>
export type UpdateStorage = CreateStorage

export type StorageOption = {
  id: string
  name: string
}
