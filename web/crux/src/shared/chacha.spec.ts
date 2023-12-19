import { decryptChaCha20, encryptChaCha20, generateChacha20Key } from './chacha'

describe('chachaEncryption', () => {
  const validKey = 'pdFwmrUV8SV6Diw0UKJvRcdUg8D9sZv7ZKC4UNReq8s'
  const testData = 'test'
  const encryptedData = Buffer.from('89a77ceee666dfb2f142ad5d7f94df5c3a96c932fc3320b3f404ce543ca71f3e', 'hex')

  describe('generateChacha20Key', () => {
    it('should generate key', () => {
      const key = generateChacha20Key()

      expect(key).not.toBeNull()
      expect(key).not.toBe('')
    })

    it('the generated key can be used as a ChaCha20 key', () => {
      const key = generateChacha20Key()

      expect(() => encryptChaCha20(key, testData)).not.toThrow()
    })
  })

  describe('encryptChaCha20', () => {
    it('can encrypt data', () => {
      const data = encryptChaCha20(validKey, testData)

      expect(data).not.toBeNull()
    })
  })

  describe('decryptChaCha20', () => {
    it('can decrypt data', () => {
      const data = decryptChaCha20(validKey, encryptedData)

      expect(data).not.toBeNull()
      expect(data).toBe(testData)
    })
  })
})
