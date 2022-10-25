import { KeyCertPair } from '@grpc/grpc-js'
import { Logger } from '@nestjs/common'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Loads cert files from the cert directory
 *
 * @throws {Error}
 * @returns {gRPCKeys}
 */
export default function getServerCredentials(prefix: string, handleErr: CallableFunction): KeyCertPair[] {
  const logger: Logger = new Logger('getServerCredentials')

  try {
    const privateKey = readFileSync(join(__dirname, `../../certs/${prefix}-private.key`))
    const certChain = readFileSync(join(__dirname, `../../certs/${prefix}-public.crt`))
    return [<KeyCertPair>{ private_key: privateKey, cert_chain: certChain }]
  } catch (err) {
    logger.error(`Error while loading TLS Cert files: ${err}`)
    handleErr()
    return []
  }
}
