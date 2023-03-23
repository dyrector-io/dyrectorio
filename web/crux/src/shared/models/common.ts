export type UniqueKey = {
  id: string
  key: string
}

export type UniqueKeyValue = UniqueKey & {
  value: string
}

export type UniqueSecretKey = UniqueKey & {
  required: boolean
}

export type UniqueSecretKeyValue = UniqueKeyValue &
  UniqueSecretKey & {
    encrypted: boolean
    publicKey?: string
  }
