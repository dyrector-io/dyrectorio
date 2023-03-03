export type Storage = {
  id: string
  icon?: string
  name: string
  description?: string
  url: string
  accessKey?: string
  secretKey?: string
  inUse: boolean
}

export type StorageListItem = Omit<Storage, 'inUse' | 'accessKey' | 'secretKey'>

export type CreateStorage = Omit<Storage, 'id' | 'inUse'>
export type UpdateStorage = Omit<Storage, 'inUse'>

export type StorageOption = {
  id: string
  name: string
}
