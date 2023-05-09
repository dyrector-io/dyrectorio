import { Injectable } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { ReadStream } from 'fs'
import { ContainerConfigData, ContainerVolumeType } from 'src/domain/container'
import { toPrismaJson } from 'src/domain/utils'
import { CruxNotFoundException } from 'src/exception/crux-exception'
import {
  deploymentStrategyFromJSON,
  exposeStrategyFromJSON,
  networkModeFromJSON,
  restartPolicyFromJSON,
} from 'src/grpc/protobuf/proto/common'
import PrismaService from 'src/services/prisma.service'
import TemplateFileService, { TemplateContainerConfig, TemplateImage } from 'src/services/template.file.service'
import { SIMPLE_PRODUCT_VERSION_NAME } from 'src/shared/const'
import { v4 } from 'uuid'
import ImageMapper from '../image/image.mapper'
import { CreateProductDto, ProductDto } from '../product/product.dto'
import ProductService from '../product/product.service'
import RegistryService from '../registry/registry.service'
import { CreateVersionDto } from '../version/version.dto'
import VersionService from '../version/version.service'
import { CreateProductFromTemplateDto } from './template.dto'

const VERSION_NAME = '1.0.0'

@Injectable()
export default class TemplateService {
  constructor(
    private prisma: PrismaService,
    private productService: ProductService,
    private templateFileService: TemplateFileService,
    private registryService: RegistryService,
    private versionService: VersionService,
    private imageMapper: ImageMapper,
  ) {}

  async createProductFromTemplate(req: CreateProductFromTemplateDto, identity: Identity): Promise<ProductDto> {
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
                    userId: identity.id,
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
          this.registryService.createRegistry(
            {
              ...it,
              description: it.description ?? '',
            },
            identity,
          ),
        )
      await Promise.all(createRegistries)
    }

    const createProductReq: CreateProductDto = {
      name: req.name,
      description: req.description,
      type: req.type,
    }

    const product = await this.productService.createProduct(createProductReq, identity)

    await this.createVersion(template.images, product, identity)

    return product
  }

  async getImageStream(id: string): Promise<ReadStream> {
    try {
      return this.templateFileService.getTemplateImageStreamById(id)
    } catch (err) {
      throw new CruxNotFoundException({ message: 'Template image not found.', property: 'template', value: id })
    }
  }

  private idify<T extends object>(object: T): T {
    return { ...object, id: v4() }
  }

  private mapTemplateConfig(config: TemplateContainerConfig): ContainerConfigData {
    // TODO (@m8vago): validate containerConfigData

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
      args: config.args ? config.args.map(it => this.idify(it)) : [],
      volumes: config.volumes
        ? toPrismaJson(
            config.volumes.map(it => ({
              ...this.idify(it),
              type: it.type ? (it.type as ContainerVolumeType) : 'rwo',
            })),
          )
        : [],
      secrets: config.secrets ? config.secrets.map(it => this.idify(it)) : [],
    }
  }

  private async createVersion(templateImages: TemplateImage[], product: ProductDto, identity: Identity): Promise<void> {
    const { id: productId } = product

    let version =
      product.type === 'complex'
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

    if (version === null) {
      const createReq: CreateVersionDto = {
        name: VERSION_NAME,
        type: 'incremental',
        changelog: null,
      }

      const newVersion = await this.versionService.createVersion(productId, createReq, identity)
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
                  userId: identity.id,
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
          registryId,
          versionId: version.id,
          createdBy: identity.id,
          name: it.image,
          order: index,
          tag: it.tag,
          config: {
            create: {
              ...config,
              id: undefined,
            },
          },
        },
      })
    })

    await this.prisma.$transaction(images)
  }
}
