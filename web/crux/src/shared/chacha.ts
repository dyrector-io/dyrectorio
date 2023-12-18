import * as crypto from 'crypto'

type EncryptedData = {
  nonce: Buffer
  encrypted: Buffer
  authTag: Buffer
}

const KEY_LENGTH = 32
const INIT_VECTOR_LENGTH = 12
const AUTH_TAG_LENGTH = 16

const concatEncryptedData = (data: EncryptedData): Buffer => Buffer.concat([data.authTag, data.nonce, data.encrypted])

const sliceEncryptedBuffer = (data: Buffer): EncryptedData => {
  const encryptedDataStart = AUTH_TAG_LENGTH + INIT_VECTOR_LENGTH

  return {
    authTag: data.subarray(0, AUTH_TAG_LENGTH),
    nonce: data.subarray(AUTH_TAG_LENGTH, encryptedDataStart),
    encrypted: data.subarray(encryptedDataStart),
  }
}

export const encryptChaCha20 = (key: string, data: string): Buffer => {
  const cipherKey = Buffer.from(key, 'base64url')
  const nonce = crypto.randomBytes(INIT_VECTOR_LENGTH)

  const binaryData = Buffer.from(data)

  const cipher = crypto.createCipheriv('chacha20-poly1305', cipherKey, nonce, { authTagLength: AUTH_TAG_LENGTH })

  let encrypted = cipher.update(binaryData)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  const authTag = cipher.getAuthTag()

  return concatEncryptedData({
    authTag,
    nonce,
    encrypted,
  })
}

export const decryptChaCha20 = (key: string, binary: Buffer): string => {
  const data = sliceEncryptedBuffer(binary)

  const cipherKey = Buffer.from(key, 'base64url')

  const decipher = crypto.createDecipheriv('chacha20-poly1305', cipherKey, data.nonce, {
    authTagLength: AUTH_TAG_LENGTH,
  })
  decipher.setAuthTag(data.authTag)

  const decrypted = decipher.update(data.encrypted)
  return Buffer.concat([decrypted, decipher.final()]).toString()
}

export const generateChacha20Key = (): string => crypto.randomBytes(KEY_LENGTH).toString('base64url')
