export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never }
export type XOR<T, U> = T | U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U

export type UniqueKey = {
  id: string
  key: string
}

export type UniqueKeyValue = {
  id: string
  key: string
  value: string
}

export type UniqueSecretKey = UniqueKey & {
  required: boolean
}

export type UniqueSecretKeyValue = UniqueKeyValue & {
  publicKey: string
  required: boolean
  encrypted?: boolean
}
