export type FindImageMessage = {
  registryId: string
  filter: string
}

export type FindImageResult = {
  name: string
}

export type FindImageResultMessage = {
  registryId: string
  images: FindImageResult[]
}

export type RegistryImages = {
  registryId: string
  images: string[]
}

export type FetchImageTagsMessage = RegistryImages

export type RegistryImageTag = {
  created: string
}

export type RegistryImageTags = {
  name: string
  tags: Record<string, RegistryImageTag>
}

export type RegistryImageTagsMessage = {
  registryId: string
  images: RegistryImageTags[]
}
