import { Prisma, PrismaClient } from '@prisma/client'
import { version } from './data/demo/version'
import { product } from './data/demo/product'
import { registry } from './data/demo/registry'
import { images } from './data/demo/images'
import { DemoConstants } from './consts'
import { getContainerConfig } from './data/demo/container_config'

const prisma = new PrismaClient()

enum TableNames {
  Product,
  Version,
  Registry,
  Image,
  ContainerConfig,
}

async function main() {
  const commandLineArgs = process.argv.slice(2)
  const userId = commandLineArgs[0]
  const teamId = commandLineArgs[1]

  if (!userId || !teamId) {
    console.error('Missing command line parameters, try npm run demo-seed "userId" "teamId"')
    return
  }

  await deleteDemoRelatedData()

  console.info('Running demo-seed command ...')
  //Registry seed
  await prisma.registry.create({
    data: registry(userId, teamId),
  })

  // Product seed
  await prisma.product.create({
    data: product(userId, teamId),
  })

  // Version seed
  await prisma.version.create({ data: version(userId) })

  // Images seed
  await Promise.all(
    images.map(async it => {
      const image = await prisma.image.create({
        data: it,
      })

      const containerConfig = getContainerConfig(image.id, image.name)
      await prisma.containerConfig.create({
        data: {
          ...containerConfig,
          environment: containerConfig.environment as Prisma.InputJsonArray,
          capabilities: containerConfig.capabilities as Prisma.InputJsonArray,
          config: containerConfig.config as Prisma.InputJsonValue,
        },
      })
    }),
  )
  console.info('The demo-seed command has been executed.')
}

async function deleteDemoRelatedData() {
  console.info('Delete demo related database data.')
  try {
    const demoRelatedImages = <string>(
      (<[{ id: string }]>(
        await prisma.$queryRawUnsafe(
          `SELECT \"id\" FROM \"public\".\"${TableNames[TableNames.Image]}\" WHERE \"registryId\" = '${
            DemoConstants.REGISTRY_ID
          }';`,
        )
      ))
        .flatMap(x => (x.id = `'${x.id}'`))
        .join(',')
    )

    demoRelatedImages ??
      (await prisma.$transaction([
        prisma.$executeRawUnsafe(
          `DELETE FROM \"public\".\"${
            TableNames[TableNames.ContainerConfig]
          }\" WHERE \"imageId\" IN (${demoRelatedImages});`,
        ),
        prisma.$executeRawUnsafe(
          `DELETE FROM \"public\".\"${TableNames[TableNames.Image]}\" WHERE \"id\" IN (${demoRelatedImages});`,
        ),
      ]))

    await prisma.$transaction([
      prisma.$executeRawUnsafe(
        `DELETE FROM \"public\".\"${TableNames[TableNames.Version]}\" WHERE \"productId\" = '${
          DemoConstants.PRODUCT_ID
        }';`,
      ),
      prisma.$executeRawUnsafe(
        `DELETE FROM \"public\".\"${TableNames[TableNames.Product]}\" WHERE \"id\" = '${DemoConstants.PRODUCT_ID}';`,
      ),
      prisma.$executeRawUnsafe(
        `DELETE FROM \"public\".\"${TableNames[TableNames.Registry]}\" WHERE \"id\" = '${DemoConstants.REGISTRY_ID}';`,
      ),
    ])
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
  }
}

main()
  .catch(e => {
    deleteDemoRelatedData()
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
