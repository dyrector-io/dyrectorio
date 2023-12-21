export type RegistryTokenOptions = {
  token: string
  cruxUiUrl: string
  teamSlug: string
  registryId: string
}

export type RegistryTokenPayload = {
  sub: string
  registryId: string
  nonce: string
}
