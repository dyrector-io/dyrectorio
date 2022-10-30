import { PrismaClient } from '@prisma/client'
import { buildVersion } from './data/demo/version'
import { buildProduct } from './data/demo/product'
import { buildRegistry } from './data/demo/registry'
import { ImageName, images } from './data/demo/images'
import { DemoConstants } from './consts'
import { buildContainerConfig } from './data/demo/container_config'

const prisma = new PrismaClient()

async function main() {
  const commandLineArgs = process.argv.slice(2)
  const userId = commandLineArgs[0]
  const teamId = commandLineArgs[1]

  if (!userId || !teamId) {
    console.error('Missing command line parameters, try npm run demo-seed "userId" "teamId"')
    return
  }

  const usersOnTeams = await prisma.usersOnTeams.findMany({ where: { teamId: teamId } }).catch(() => {})

  if (!usersOnTeams) {
    console.error('Team does not exist or no users are assigned to it.')
    return
  } else if (!usersOnTeams.find(x => x.userId == userId)) {
    console.error('User does not exist or not part of the team.')
    return
  }

  await deleteDemoRelatedData()

  console.info('Running demo-seed command ...')

  await prisma.$transaction([
    //Registry seed
    prisma.registry.createMany({
      data: buildRegistry(userId, teamId),
    }),

    // Product seed
    prisma.product.create({
      data: buildProduct(userId, teamId),
    }),

    // Version seed
    prisma.version.create({
      data: buildVersion(userId),
    }),
  ])

  //Images seed
  await Promise.all(
    images.map(async it => {
      const image = await prisma.image.create({
        data: { ...it, createdBy: userId },
      })

      // Container config seed
      const containerConfig = buildContainerConfig(image.id, image.name as ImageName)
      await prisma.containerConfig.create({
        data: {
          ...containerConfig,
        },
      })
    }),
  )
  console.info('The demo-seed command has been executed.')
}

async function deleteDemoRelatedData() {
  console.info('Delete demo related database data.')
  try {
    const [deploymentResponse, imageResponse] = await prisma.$transaction([
      prisma.deployment.findMany({
        where: {
          versionId: DemoConstants.VERSION_ID,
        },
        select: { id: true },
      }),
      prisma.image.findMany({
        where: {
          registryId: {
            in: [DemoConstants.MICROSERVICES_REGISTRY_ID, DemoConstants.DOCKER_HUB_REGISTRY_ID],
          },
        },
        select: { id: true },
      }),
    ])

    const demoRelatedImages = imageResponse.map(image => image.id)
    const demoRelatedDeployments = deploymentResponse.map(deployment => deployment.id)

    await prisma.$transaction([
      prisma.containerConfig.deleteMany({
        where: {
          imageId: {
            in: demoRelatedImages,
          },
        },
      }),
      prisma.image.deleteMany({
        where: {
          id: {
            in: demoRelatedImages,
          },
        },
      }),
      prisma.deploymentEvent.deleteMany({
        where: {
          deploymentId: {
            in: demoRelatedDeployments,
          },
        },
      }),
      prisma.deployment.deleteMany({
        where: {
          id: {
            in: demoRelatedDeployments,
          },
        },
      }),
      prisma.version.deleteMany({
        where: {
          productId: DemoConstants.PRODUCT_ID,
        },
      }),
      prisma.product.deleteMany({
        where: {
          id: DemoConstants.PRODUCT_ID,
        },
      }),
      prisma.registry.deleteMany({
        where: {
          id: {
            in: [DemoConstants.MICROSERVICES_REGISTRY_ID, DemoConstants.DOCKER_HUB_REGISTRY_ID],
          },
        },
      }),
    ])
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
    throw err
  }
}

main()
  .catch(err => {
    deleteDemoRelatedData()
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
