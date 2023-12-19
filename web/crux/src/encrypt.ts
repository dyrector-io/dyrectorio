/* eslint-disable no-console */
import { exit } from 'process'
import { PrismaTransactionClient } from './domain/utils'
import PrismaService from './services/prisma.service'
import { decryptChaCha20, encryptChaCha20, generateChacha20Key } from './shared/chacha'

const AVAILABLE_COMMANDS = ['generate', 'migrate', 'rotate'] as const
export type EncryptionCommand = (typeof AVAILABLE_COMMANDS)[number]

type MigratedRegistryToken = {
  id: string
  token?: string
}

type EncryptedRegistryToken = {
  id: string
  token?: Buffer
}

type MigratedStorageCredential = {
  id: string
  accessKey?: string
  secretKey?: string
}

type EncryptedStorageCredential = {
  id: string
  accessKey?: Buffer
  secretKey?: Buffer
}

const updateRegistries = async (prisma: PrismaTransactionClient, registries: EncryptedRegistryToken[]) => {
  console.info('Updating registries')

  await Promise.all(
    registries.map(
      async it =>
        await prisma.$executeRawUnsafe('UPDATE "Registry" SET "token" = $1 WHERE "id" = $2::uuid', it.token, it.id),
    ),
  )
}

const updateStorages = async (prisma: PrismaTransactionClient, storages: EncryptedStorageCredential[]) => {
  console.info('Updating storages')

  await Promise.all(
    storages.map(
      async it =>
        await prisma.$executeRawUnsafe(
          'UPDATE "Storage" SET "accessKey" = $1, "secretKey" = $2 WHERE "id" = $3::uuid',
          it.accessKey,
          it.secretKey,
          it.id,
        ),
    ),
  )
}

const getSecretKeyEnv = (): string => {
  const secretKey = process.env.ENCRYPTION_SECRET_KEY
  if (!secretKey || secretKey.trim() !== secretKey) {
    console.error('Invalid or missing env variable: ENCRYPTION_SECRET_KEY')
    console.error('You can generate one with `npm run encrypt:generate`')
    exit(-1)
  }

  return secretKey
}

const PRISMA_MIGRATIONS_REGISTRY = '_prisma_migrations_Registry'
const PRISMA_MIGRATIONS_STORAGE = '_prisma_migrations_Storage'
export const encryptMigratedSecrets = async (prismaService: PrismaService) => {
  const encryptionKey = getSecretKeyEnv()

  // registries
  if (await prismaService.tableExists(PRISMA_MIGRATIONS_REGISTRY)) {
    console.info('Migrating registries')

    await prismaService.$transaction(async prisma => {
      const registries: MigratedRegistryToken[] = await prisma.$queryRawUnsafe(
        `SELECT "id", "token" FROM "${PRISMA_MIGRATIONS_REGISTRY}"`,
      )

      const encryptedRegistries: EncryptedRegistryToken[] = registries.map(it => ({
        ...it,
        token: encryptChaCha20(encryptionKey, it.token),
      }))

      await updateRegistries(prisma, encryptedRegistries)

      console.info('Dropping temp table')
      await prisma.$executeRawUnsafe(`DROP TABLE "${PRISMA_MIGRATIONS_REGISTRY}"`)
    })
  }

  // storages
  if (await prismaService.tableExists(PRISMA_MIGRATIONS_STORAGE)) {
    console.info('Migrating storages')

    await prismaService.$transaction(async prisma => {
      const storages: MigratedStorageCredential[] = await prisma.$queryRawUnsafe(
        `SELECT "id", "accessKey", "secretKey" FROM "${PRISMA_MIGRATIONS_STORAGE}"`,
      )

      const encryptedStorages: EncryptedStorageCredential[] = storages.map(it => ({
        ...it,
        accessKey: it.accessKey ? encryptChaCha20(encryptionKey, it.accessKey) : null,
        secretKey: it.accessKey ? encryptChaCha20(encryptionKey, it.secretKey) : null,
      }))

      await updateStorages(prisma, encryptedStorages)

      console.info('Dropping temp table')
      await prisma.$executeRawUnsafe(`DROP TABLE "${PRISMA_MIGRATIONS_STORAGE}"`)
    })
  }
}

// commands
const KEY_ROATATIONS_REGISTRY = '_crux_key_rotations_Registry'
const KEY_ROATATIONS_STORAGE = '_crux_key_rotations_Storage'
const rotateKeys = async () => {
  const newKey = getSecretKeyEnv()

  const oldKey = process.env.ENCRYPTION_DEPRECATED_KEY
  if (!oldKey || oldKey.trim() !== oldKey) {
    console.error('Invalid or missing env variable: ENCRYPTION_DEPRECATED_KEY')
    console.error(
      'You have to provide the `ENCRYPTION_DEPRECATED_KEY` with your old key to decrypt your current secrets',
    )
    exit(-1)
  }

  const prismaService = new PrismaService()
  await prismaService.$transaction(async prisma => {
    await prisma.$executeRawUnsafe(
      `SELECT "id", "token" INTO "${KEY_ROATATIONS_REGISTRY}" FROM "Registry" WHERE "token" IS NOT NULL`,
    )
    console.info('Registry tokens have been saved into a temp table')

    await prisma.$executeRawUnsafe(
      `SELECT "id", "accessKey", "secretKey" INTO "${KEY_ROATATIONS_STORAGE}" FROM "Storage" WHERE "accessKey" IS NOT NULL OR "secretKey" IS NOT NULL`,
    )
    console.info('Storage credentials have been saved into a temp table')

    const registries: EncryptedRegistryToken[] = await prisma.$queryRawUnsafe(
      `SELECT "id", "token" FROM "${KEY_ROATATIONS_REGISTRY}"`,
    )
    const storages: EncryptedStorageCredential[] = await prisma.$queryRawUnsafe(
      `SELECT "id", "accessKey", "secretKey" FROM "${KEY_ROATATIONS_STORAGE}"`,
    )

    console.info(`Rotating keys on ${registries.length} registries`)
    registries.forEach(it => {
      const decrypted = decryptChaCha20(oldKey, it.token)
      it.token = encryptChaCha20(newKey, decrypted)
    })

    await updateRegistries(prisma, registries)

    console.info(`Rotating keys on ${storages.length} storages`)
    storages.forEach(it => {
      const decryptedAccKey = decryptChaCha20(oldKey, it.accessKey)
      const decryptedSecKey = decryptChaCha20(oldKey, it.secretKey)

      it.accessKey = encryptChaCha20(newKey, decryptedAccKey)
      it.secretKey = encryptChaCha20(newKey, decryptedSecKey)
    })

    await updateStorages(prisma, storages)

    console.info('Success. You can now remove the ENCRYPTION_DEPRECATED_KEY env variable.')

    console.info('Dropping temp tables')
    await prisma.$executeRawUnsafe(`DROP TABLE "${KEY_ROATATIONS_REGISTRY}"`)
    await prisma.$executeRawUnsafe(`DROP TABLE "${KEY_ROATATIONS_STORAGE}"`)
  })
}

const generateKey = () => {
  console.info('Generating ChaCha20 compatible key')
  const key = generateChacha20Key()

  console.info(key)
}

const argsToEncryptionCommand = (args: string[]): EncryptionCommand | null => {
  const encryptionCommand: boolean = args.length >= 3 && args[2] === 'encrypt'
  if (!encryptionCommand) {
    return null
  }

  return args.length < 4 ? null : (process.argv[3] as EncryptionCommand)
}

const executeAsyncCommand = (command: Promise<void>) => {
  command
    .then(() => exit(0))
    .catch(err => {
      console.error('An error occured')
      console.error(err)
      exit(-1)
    })
}

const encrypt = (args: string[]) => {
  const command = argsToEncryptionCommand(args)

  switch (command) {
    case 'generate':
      generateKey()
      break
    case 'rotate':
      executeAsyncCommand(rotateKeys())
      break
    default: {
      console.info('Encryption Commands:')
      console.info('generate - Generate encryption key')
      console.info('rotate - Rotate keys')
    }
  }
}

export default encrypt
