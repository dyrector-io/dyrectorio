export type BasicStorage = {
  id: string
  name: string
}

export type Storage = BasicStorage & {
  description?: string
  icon?: string
  url: string
}

type StorageCredentials = {
  changeCredentials: boolean
  accessKey?: string
  secretKey?: string
}

export type StorageDetails = Storage & {
  public: boolean
  inUse: boolean
}

export type EditableStorage = StorageDetails & StorageCredentials

export type CreateStorage = Omit<StorageDetails & StorageCredentials, 'id' | 'inUse' | 'changeCredentials'>

export type UpdateStorage = CreateStorage

export type StorageOption = {
  id: string
  name: string
}

export const editableStorageToDto = (storage: EditableStorage): CreateStorage | UpdateStorage => {
  const dto: CreateStorage | UpdateStorage = {
    name: storage.name,
    description: storage.description,
    icon: storage.icon,
    url: storage.url,
    public: storage.public,
  }

  if (!storage.public && storage.changeCredentials) {
    dto.accessKey = storage.accessKey
    dto.secretKey = storage.secretKey
  }

  return dto
}
