import { decryptChaCha20, encryptChaCha20, generateChacha20Key } from './chacha'

describe('chachaEncryption', () => {
  const validKey = 'a5d1709ab515f1257a0e2c3450a26f45c75483c0fdb19bfb64a0b850d45eabcb'
  const testData = 'test'
  const encryptedData = Buffer.from('e918fda7509f9bb73af27d0304475d159c2b48f19885f4a6c2e88e023b3f63c0', 'hex')

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
