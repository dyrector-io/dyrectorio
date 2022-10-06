import { Injectable, Logger } from '@nestjs/common'
import { ProductTypeEnum } from '@prisma/client'
import { version } from 'os'
import {
  AddImagesToVersionRequest,
  CreateEntityResponse,
  CreateProductFromTemplateRequest,
  CreateProductRequest,
  CreateVersionRequest,
  ImageResponse,
  productTypeFromJSON,
  versionTypeFromJSON,
} from 'src/grpc/protobuf/proto/crux'
import PrismaService from 'src/services/prisma.service'
import TemplateFileService, {
  TemplateImage,
  TemplateProduct,
  TemplateVersion,
} from 'src/services/template.file.service'
import ImageService from '../image/image.service'
import ProductService from '../product/product.service'
import RegistryService from '../registry/registry.service'
import VersionService from '../version/version.service'
import { v4 as uuid, v4 } from 'uuid'
import { UniqueKeyValue } from 'src/shared/model'

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

    const templateProduct = template.product
    const createProductReq: CreateProductRequest = {
      accessedBy: req.accessedBy,
      name: req.productName,
      description: templateProduct.description,
      type: productTypeFromJSON(templateProduct.type.toUpperCase()),
    }

    const product = await this.productService.createProduct(createProductReq)

    const createVersions = templateProduct.versions.map(it =>
      this.createVersion(it, templateProduct, product, req.accessedBy),
    )
    await Promise.all(createVersions)

    return product
  }

  private async createVersion(
    templateVersion: TemplateVersion,
    templateProduct: TemplateProduct,
    product: CreateEntityResponse,
    accessedBy: string,
  ): Promise<void> {
    let version =
      templateProduct.type === ProductTypeEnum.simple
        ? await this.prisma.version.findFirst({
            where: {
              name: ProductService.SIMPLE_PRODUCT_VERSION_NAME,
              productId: product.id,
            },
          })
        : await this.prisma.version.findFirst({
            where: {
              name: templateVersion.name!,
              productId: product.id,
            },
          })

    if (version == null) {
      const createReq: CreateVersionRequest = {
        accessedBy: accessedBy,
        productId: product.id,
        name: templateVersion.name,
        type: versionTypeFromJSON(templateVersion.type.toUpperCase()),
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
          in: templateVersion.images
            .map(it => it.registryName)
            .filter((value, index, array) => array.indexOf(value) === index),
        },
      },
    })

    const createImages = templateVersion.images.map(it => {
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
          array.map(it => ({
            ...it,
            id: v4(),
          }))

        const config = {
          name: imageTemplate.name,
          config: imageTemplate.config,
          capabilities: mapKeyValues(imageTemplate.capabilities),
          environment: mapKeyValues(imageTemplate.environment),
          secrets: mapKeyValues(imageTemplate.secrets),
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
