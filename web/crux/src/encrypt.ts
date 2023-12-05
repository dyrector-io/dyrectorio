/* eslint-disable no-console */
import { execSync } from 'child_process'
import { exit } from 'process'
import PrismaService from './services/prisma.service'
import { decryptChaCha20, encryptChaCha20, generateChacha20Key } from './shared/chacha'
import { PrismaTransactionClient } from './domain/utils'

const AVAILABLE_COMMANDS = ['generate', 'migrate', 'rotate'] as const
export type EncryptionCommand = (typeof AVAILABLE_COMMANDS)[number]

const MIGRATION_BEFORE_ENCRYPTION = '20231103155210_working_directory'

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

const saveExistingSecrets = async (prisma: PrismaService) => {
  await prisma.$executeRaw`SELECT "id", "token" INTO "_prisma_migrations_Registry" FROM "Registry" WHERE "token" IS NOT NULL`
  console.info('Registry tokens have been saved into a temp table')

  await prisma.$executeRaw`SELECT "id", "accessKey", "secretKey" INTO "_prisma_migrations_Storage" FROM "Storage" WHERE "accessKey" IS NOT NULL OR "secretKey" IS NOT NULL`
  console.info('Storage credentials have been saved into a temp table')
}

const executeUpdates = async (
  prisma: PrismaTransactionClient,
  registries: EncryptedRegistryToken[],
  storages: EncryptedStorageCredential[],
) => {
  console.info('Updating registries')
  await Promise.all(
    registries.map(
      async it =>
        await prisma.$executeRawUnsafe('UPDATE "Registry" SET "token" = $1 WHERE "id" = $2::uuid', it.token, it.id),
    ),
  )

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

const executePrismaMigrations = () => execSync('npx prisma migrate deploy')

// commands
const migrate = async () => {
  const prismaService = new PrismaService()
  const lastMigration = await prismaService.findLastMigration()

  let encryptionKey: string | null = null

  if (lastMigration !== MIGRATION_BEFORE_ENCRYPTION) {
    executePrismaMigrations()
    return
  }

  encryptionKey = getSecretKeyEnv()

  console.info('Migrating secrets.')

  await saveExistingSecrets(prismaService)

  const registries: MigratedRegistryToken[] =
    await prismaService.$queryRaw`SELECT "id", "token" FROM "_prisma_migrations_Registry"`
  const storages: MigratedStorageCredential[] =
    await prismaService.$queryRaw`SELECT "id", "accessKey", "secretKey" FROM "_prisma_migrations_Storage"`

  const encryptedRegistries: EncryptedRegistryToken[] = registries.map(it => ({
    ...it,
    token: encryptChaCha20(encryptionKey, it.token),
  }))

  const encryptedStorages: EncryptedStorageCredential[] = storages.map(it => ({
    ...it,
    accessKey: it.accessKey ? encryptChaCha20(encryptionKey, it.accessKey) : null,
    secretKey: it.accessKey ? encryptChaCha20(encryptionKey, it.secretKey) : null,
  }))

  executePrismaMigrations()

  await prismaService.$transaction(async prisma => {
    await executeUpdates(prisma, encryptedRegistries, encryptedStorages)

    console.info('Dropping temp tables')
    await prisma.$executeRaw`DROP TABLE "_prisma_migrations_Registry"`
    await prisma.$executeRaw`DROP TABLE "_prisma_migrations_Storage"`
  })
}

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
    await prisma.$executeRaw`SELECT "id", "token" INTO "_crux_key_rotations_Registry" FROM "Registry" WHERE "token" IS NOT NULL`
    console.info('Registry tokens have been saved into a temp table')

    await prisma.$executeRaw`SELECT "id", "accessKey", "secretKey" INTO "_crux_key_rotations_Storage" FROM "Storage" WHERE "accessKey" IS NOT NULL OR "secretKey" IS NOT NULL`
    console.info('Storage credentials have been saved into a temp table')

    const registries: EncryptedRegistryToken[] =
      await prisma.$queryRaw`SELECT "id", "token" FROM "_crux_key_rotations_Registry"`
    const storages: EncryptedStorageCredential[] =
      await prisma.$queryRaw`SELECT "id", "accessKey", "secretKey" FROM "_crux_key_rotations_Storage"`

    console.info(`Rotating keys on ${registries.length} registries`)
    registries.forEach(it => {
      const decrypted = decryptChaCha20(oldKey, it.token)
      it.token = encryptChaCha20(newKey, decrypted)
    })

    console.info(`Rotating keys on ${storages.length} storages`)
    storages.forEach(it => {
      const decryptedAccKey = decryptChaCha20(oldKey, it.accessKey)
      const decryptedSecKey = decryptChaCha20(oldKey, it.secretKey)

      it.accessKey = encryptChaCha20(newKey, decryptedAccKey)
      it.secretKey = encryptChaCha20(newKey, decryptedSecKey)
    })

    await executeUpdates(prisma, registries, storages)

    console.info('Success. You can now remove the ENCRYPTION_DEPRECATED_KEY env variable.')

    console.info('Dropping temp tables')
    await prisma.$executeRaw`DROP TABLE "_crux_key_rotations_Registry"`
    await prisma.$executeRaw`DROP TABLE "_crux_key_rotations_Storage"`
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

const encrypt = async (args: string[]) => {
  const command = argsToEncryptionCommand(args)

  switch (command) {
    case 'generate':
      generateKey()
      break
    case 'migrate':
      await migrate()
      break
    case 'rotate':
      await rotateKeys()
      break
    default: {
      console.info('Encryption Commands:')
      console.info('generate - Generate encryption key')
      console.info('migrate - Migrate existing data')
      console.info('rotate - Rotate keys')
    }
  }
}

export default encrypt
