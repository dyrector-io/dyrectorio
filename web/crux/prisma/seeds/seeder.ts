import { Prisma, PrismaClient } from '@prisma/client'
import { versions } from './data/versions'
import { products } from './data/products'
import { teams } from './data/teams'
import { nodes } from './data/nodes'
import { registries } from './data/registries'
import { images } from './data/images'
import { deployments } from './data/deployments'
import { containerConfigs } from './data/container_configs'
import { deploymentEvents } from './data/deployment_events'
import { instances } from './data/instances'
import { usersOnTeam } from './data/users_on_team'

const prisma = new PrismaClient()

const tableNames = [
  'Product',
  'Version',
  'Team',
  'Registry',
  'Node',
  'Image',
  'Deployment',
  'ContainerConfig',
  'DeploymentEvent',
  'Instance',
]

async function main() {
  await dropDatabase()

  console.log('🍃 Seeding [Team] table.')
  await prisma.team.createMany({
    data: teams,
  })

  console.log('🍃 Seeding [Registry] table.')
  await Promise.all(
    registries.map(async it => {
      await prisma.registry.create({
        data: it,
      })
    }),
  )

  console.log('🍃 Seeding [Node] table.')
  await prisma.node.createMany({
    data: nodes,
  })

  console.log('🍃 Seeding [Product] table.')
  await Promise.all(
    products.map(async it => {
      await prisma.product.create({
        data: it,
      })
    }),
  )

  console.log('🍃 Seeding [Version] table.')
  await prisma.version.createMany({
    data: versions,
  })

  console.log('🍃 Seeding [Images] table.')
  await Promise.all(
    images.map(async it => {
      await prisma.image.create({
        data: it,
      })
    }),
  )

  console.log('🍃 Seeding [Deployments] table.')
  await Promise.all(
    deployments.map(async it => {
      await prisma.deployment.create({
        data: {
          ...it,
          environment: it.environment as Prisma.InputJsonArray,
        },
      })
    }),
  )

  console.log('🍃 Seeding [Events] table.')
  await Promise.all(
    deploymentEvents.map(async it => {
      await prisma.deploymentEvent.create({
        data: {
          ...it,
          value: it.value as Prisma.InputJsonValue,
        },
      })
    }),
  )

  console.log('🍃 Seeding [ContainerConfigs] table.')
  await Promise.all(
    containerConfigs.map(async it => {
      await prisma.containerConfig.create({
        data: {
          ...it,
          environment: it.environment as Prisma.InputJsonArray,
          capabilities: it.capabilities as Prisma.InputJsonArray,
          secrets: it.secrets as Prisma.InputJsonArray,
          config: it.config as Prisma.InputJsonValue,
        },
      })
    }),
  )

  console.log('🍃 Seeding [Instances] table.')
  await Promise.all(
    instances.map(async it => {
      await prisma.instance.create({
        data: it,
      })
    }),
  )

  console.log('🍃 Seeding [UsersOnTeams] table.')
  await Promise.all(
    usersOnTeam.map(async it => {
      await prisma.usersOnTeams.create({
        data: it,
      })
    }),
  )
}

async function dropDatabase() {
  console.info('🚨 Droppping database data.')
  try {
    for (const tableName of tableNames) {
      await prisma.$queryRawUnsafe(`TRUNCATE TABLE \"public\".\"${tableName}\" CASCADE;`)
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
  }
}

main()
  .catch(err => {
    dropDatabase()
    console.info('🔥 The seed command has been failed.')
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    console.info('🌱 The seed command has been executed.')
  })
