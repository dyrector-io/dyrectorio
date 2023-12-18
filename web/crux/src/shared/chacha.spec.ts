import { decryptChaCha20, encryptChaCha20, generateChacha20Key } from './chacha'

describe('chachaEncryption', () => {
  const validKey = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
  const testData = 'test'
  const encryptedData = Buffer.from('78387294182d7586ab7bdafd0a92946dc7ac5d4918fac34989e3198c32d228aa', 'hex')

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
