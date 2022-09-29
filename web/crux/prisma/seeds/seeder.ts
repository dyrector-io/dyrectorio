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

  // Team seed
  await prisma.team.createMany({
    data: teams,
  })

  // Registry seed
  await Promise.all(
    registries.map(async it => {
      await prisma.registry.create({
        data: it,
      })
    }),
  )

  // Nodes seed
  await prisma.node.createMany({
    data: nodes,
  })

  // Product seed
  await Promise.all(
    products.map(async it => {
      await prisma.product.create({
        data: it,
      })
    }),
  )

  // Version seed
  await prisma.version.createMany({
    data: versions,
  })

  // Images seed
  await Promise.all(
    images.map(async it => {
      await prisma.image.create({
        data: it,
      })
    }),
  )

  // Deployments seed
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

  // Deployment Events seed
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

  // ContainerConfigs seed
  await Promise.all(
    containerConfigs.map(async it => {
      await prisma.containerConfig.create({
        data: {
          ...it,
        },
      })
    }),
  )

  // Instances seed
  await Promise.all(
    instances.map(async it => {
      await prisma.instance.create({
        data: it,
      })
    }),
  )

  // UsersOnTeams seed
  await Promise.all(
    usersOnTeam.map(async it => {
      await prisma.usersOnTeams.create({
        data: it,
      })
    }),
  )
}

async function dropDatabase() {
  console.info('Droppping database data.')
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
  .catch(e => {
    dropDatabase()
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
