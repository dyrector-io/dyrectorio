import { Registry } from '@prisma/client'

export type RegistryConnectionInfo = Omit<Registry, 'token'> & {
  token: string
  public: boolean
}
