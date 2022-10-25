import { Injectable, Logger } from '@nestjs/common'
import {
  AddImagesToVersionRequest,
  CreateEntityResponse,
  CreateProductFromTemplateRequest,
  CreateProductRequest,
  CreateVersionRequest,
  ImageResponse,
  ProductType,
  VersionType,
} from 'src/grpc/protobuf/proto/crux'
import PrismaService from 'src/services/prisma.service'
import TemplateFileService, {
  TemplateContainerConfig,
  TemplateCraneConfig,
  TemplateDagentConfig,
  TemplateImage,
} from 'src/services/template.file.service'
import { v4 } from 'uuid'
import { ContainerConfigData, UniqueKeyValue } from 'src/shared/model'
import {
  deploymentStrategyFromJSON,
  ExplicitContainerConfig,
  networkModeFromJSON,
  restartPolicyFromJSON,
} from 'src/grpc/protobuf/proto/common'
import { SIMPLE_PRODUCT_VERSION_NAME } from 'src/shared/const'
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
  ) {}

  async createProductFromTemplate(req: CreateProductFromTemplateRequest): Promise<CreateEntityResponse> {
    const template = await this.templateFileService.getTemplateById(req.id)

    if (template.registries && template.registries.length > 0) {
      const counts = await this.prisma.registry.findMany({
        where: {
          name: {
            in: template.registries.map(it => it.name),
          },
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

  private mapTemplateConfig(config: TemplateContainerConfig): ExplicitContainerConfig {
    const mapCraneConfig = (crane: TemplateCraneConfig) => {
      if (!crane) {
        return undefined
      }

      return {
        ...crane,
        deploymentStatregy: crane.deploymentStatregy
          ? deploymentStrategyFromJSON(crane.deploymentStatregy.toUpperCase())
          : undefined,
      }
    }

    const mapDagentConfig = (dagent: TemplateDagentConfig) => {
      if (!dagent) {
        return undefined
      }

      return {
        ...dagent,
        restartPolicy: dagent.restartPolicy ? restartPolicyFromJSON(dagent.restartPolicy.toUpperCase()) : undefined,
        networkMode: dagent.networkMode ? networkModeFromJSON(dagent.networkMode.toUpperCase()) : undefined,
      }
    }

    return {
      ...config,
      crane: mapCraneConfig(config.crane),
      dagent: mapDagentConfig(config.dagent),
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
              name: SIMPLE_PRODUCT_VERSION_NAME,
              productId: product.id,
            },
          })
        : await this.prisma.version.findFirst({
            where: {
              name: VERSION_NAME,
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
        name: {
          in: templateImages.map(it => it.registryName).filter((value, index, array) => array.indexOf(value) === index),
        },
      },
    })

    const createImages = templateImages.map(it => {
      const registryId = registryLookup.find(reg => reg.name === it.registryName).id

      const addImageRequest: AddImagesToVersionRequest = {
        accessedBy,
        versionId: version.id,
        images: [
          {
            registryId,
            imageNames: [it.image],
          },
        ],
      }

      return this.imageService.addImagesToVersion(addImageRequest).then(result => [it, result.data[0]])
    })

    const images = await Promise.all(createImages)

    await this.prisma.$transaction(
      images.map(it => {
        const imageTemplate = it[0] as TemplateImage
        const dbImage = it[1] as ImageResponse

        const mapKeyValues = (array: UniqueKeyValue[]) =>
          array.map(kv => ({
            ...kv,
            id: v4(),
          }))

        const config: ContainerConfigData = {
          name: imageTemplate.name,
          config: this.mapTemplateConfig(imageTemplate.config),
          capabilities: mapKeyValues(imageTemplate.capabilities),
          environment: mapKeyValues(imageTemplate.environment),
          secrets: [],
        }

        return this.prisma.image.update({
          include: {
            config: true,
          },
          data: {
            config: {
              update: config,
            },
            updatedBy: accessedBy,
          },
          where: {
            id: dbImage.id,
          },
        })
      }),
    )
  }
}
