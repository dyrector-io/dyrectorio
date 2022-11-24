import { Injectable, Logger } from '@nestjs/common'
import {
  deploymentStrategyFromJSON,
  exposeStrategyFromJSON,
  networkModeFromJSON,
  restartPolicyFromJSON,
  VolumeType,
  volumeTypeFromJSON,
} from 'src/grpc/protobuf/proto/common'
import {
  CreateEntityResponse,
  CreateProductFromTemplateRequest,
  CreateProductRequest,
  CreateVersionRequest,
  ProductType,
  VersionType,
} from 'src/grpc/protobuf/proto/crux'
import PrismaService from 'src/services/prisma.service'
import TemplateFileService, { TemplateContainerConfig, TemplateImage } from 'src/services/template.file.service'
import { SIMPLE_PRODUCT_VERSION_NAME } from 'src/shared/const'
import { toPrismaJson } from 'src/shared/mapper'
import { ContainerConfigData } from 'src/shared/model'
import { v4 } from 'uuid'
import ImageMapper from '../image/image.mapper'
import ImageService from '../image/image.service'
import ProductService from '../product/product.service'
import RegistryService from '../registry/registry.service'
import VersionService from '../version/version.service'

const VERSION_NAME = '1.0.0'

@Injectable()
export default class TemplateService {
  private readonly logger = new Logger(TemplateService.name)

  constructor(
    private prisma: PrismaService,
    private productService: ProductService,
    private templateFileService: TemplateFileService,
    private registryService: RegistryService,
    private versionService: VersionService,
    private imageService: ImageService,
    private imageMapper: ImageMapper,
  ) {}

  async createProductFromTemplate(req: CreateProductFromTemplateRequest): Promise<CreateEntityResponse> {
    const template = await this.templateFileService.getTemplateById(req.id)

    if (template.registries && template.registries.length > 0) {
      const counts = await this.prisma.registry.findMany({
        where: {
          AND: [
            {
              name: {
                in: template.registries.map(it => it.name),
              },
            },
            {
              team: {
                users: {
                  some: {
                    userId: req.accessedBy,
                    active: true,
                  },
                },
              },
            },
          ],
        },
      })

      const createRegistries = template.registries
        .filter(it => !counts.find(f => f.name === it.name))
        .map(it =>
          this.registryService.createRegistry({
            accessedBy: req.accessedBy,
            ...it,
            description: it.description ?? '',
          }),
        )
      await Promise.all(createRegistries)
    }

    const createProductReq: CreateProductRequest = {
      accessedBy: req.accessedBy,
      name: req.name,
      description: req.description,
      type: req.type,
    }

    const product = await this.productService.createProduct(createProductReq)

    await this.createVersion(template.images, product, req.type, req.accessedBy)

    return product
  }

  private idify<T extends { id: string }>(object: T): T {
    return { ...object, id: v4() }
  }

  private mapTemplateConfig(config: TemplateContainerConfig): ContainerConfigData {
    return {
      ...config,
      tty: config.tty ?? false,
      useLoadBalancer: config.useLoadBalancer ?? false,
      proxyHeaders: config.proxyHeaders ?? false,
      deploymentStrategy: config.deploymentStatregy
        ? this.imageMapper.deploymentStrategyToDb(
            deploymentStrategyFromJSON(config.deploymentStatregy.toLocaleUpperCase()),
          )
        : 'recreate',
      restartPolicy: config.restartPolicy
        ? this.imageMapper.restartPolicyToDb(restartPolicyFromJSON(config.restartPolicy.toLocaleUpperCase()))
        : 'no',
      networkMode: config.networkMode
        ? this.imageMapper.networkModeToDb(networkModeFromJSON(config.networkMode.toLocaleUpperCase()))
        : 'bridge',
      expose: config.expose
        ? this.imageMapper.exposeStrategyToDb(exposeStrategyFromJSON(config.expose.toLocaleUpperCase()))
        : 'none',
      networks: config.networks ? config.networks.map(it => ({ id: v4(), key: it })) : [],
      ports: config.ports ? toPrismaJson(config.ports.map(it => this.idify(it))) : [],
      environment: config.environment ? config.environment.map(it => this.idify(it)) : [],
      volumes: config.volumes
        ? toPrismaJson(
            config.volumes.map(it => ({
              ...this.idify(it),
              type: it.type ? volumeTypeFromJSON(it.type.toUpperCase()) : VolumeType.RO,
            })),
          )
        : [],
      secrets: config.secrets ? config.secrets.map(it => this.idify(it)) : [],
    }
  }

  private async createVersion(
    templateImages: TemplateImage[],
    product: CreateEntityResponse,
    productType: ProductType,
    accessedBy: string,
  ): Promise<void> {
    const { id: productId } = product

    let version =
      productType === ProductType.COMPLEX
        ? await this.prisma.version.findFirst({
            where: {
              name: VERSION_NAME,
              productId: product.id,
            },
          })
        : await this.prisma.version.findFirst({
            where: {
              name: SIMPLE_PRODUCT_VERSION_NAME,
              productId: product.id,
            },
          })

    if (version == null) {
      const createReq: CreateVersionRequest = {
        accessedBy,
        productId,
        name: VERSION_NAME,
        type: VersionType.INCREMENTAL,
      }

      const newVersion = await this.versionService.createVersion(createReq)
      version = await this.prisma.version.findFirst({
        where: {
          id: newVersion.id,
        },
      })
    }

    const registryLookup = await this.prisma.registry.findMany({
      where: {
        AND: [
          {
            name: {
              in: templateImages
                .map(it => it.registryName)
                .filter((value, index, array) => array.indexOf(value) === index),
            },
          },
          {
            team: {
              users: {
                some: {
                  userId: accessedBy,
                  active: true,
                },
              },
            },
          },
        ],
      },
    })

    const images = templateImages.map((it, index) => {
      const registryId = registryLookup.find(reg => reg.name === it.registryName).id
      const config: ContainerConfigData = this.mapTemplateConfig(it.config)

      return this.prisma.image.create({
        include: {
          config: true,
          registry: true,
        },
        data: {
          registryId: registryId,
          versionId: version.id,
          createdBy: accessedBy,
          name: it.image,
          order: index++,
          config: {
            create: {
              ...config,
            },
          },
        },
      })
    })

    await this.prisma.$transaction(images)
  }
}
