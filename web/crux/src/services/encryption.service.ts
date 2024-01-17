import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { decryptChaCha20, encryptChaCha20 } from 'src/shared/chacha'

@Injectable()
export default class EncryptionService {
  constructor(private readonly config: ConfigService) {}

  encrypt(data: string): Buffer {
    const key = this.getSecretKey()

    return encryptChaCha20(key, data)
  }

  decrypt(data: Buffer) {
    const key = this.getSecretKey()

    return decryptChaCha20(key, data)
  }

  private getSecretKey(): string {
    return this.config.get('ENCRYPTION_SECRET_KEY')
  }
}
