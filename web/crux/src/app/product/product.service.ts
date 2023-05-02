import { Injectable } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { ProductTypeEnum, VersionTypeEnum } from '@prisma/client'
import PrismaService from 'src/services/prisma.service'
import { SIMPLE_PRODUCT_VERSION_NAME } from 'src/shared/const'
import TeamRepository from '../team/team.repository'
import { CreateProductDto, ProductDetailsDto, ProductListItemDto, UpdateProductDto } from './product.dto'
import ProductMapper from './product.mapper'

@Injectable()
export default class ProductService {
  constructor(private teamRepository: TeamRepository, private prisma: PrismaService, private mapper: ProductMapper) {}

  async getProducts(identity: Identity): Promise<ProductListItemDto[]> {
    const products = await this.prisma.product.findMany({
      where: {
        team: {
          users: {
            some: {
              userId: identity.id,
              active: true,
            },
          },
        },
      },
      include: {
        _count: {
          select: {
            versions: true,
          },
        },
      },
    })

    return products.map(it => this.mapper.toDto(it))
  }

  async getProductDetails(id: string): Promise<ProductDetailsDto> {
    const product = await this.prisma.product.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        versions: {
          include: {
            children: true,
          },
        },
      },
    })

    const productInProgressDeployments = await this.prisma.product.count({
      where: {
        id,
        versions: {
          some: {
            deployments: {
              some: {
                status: 'inProgress',
              },
            },
          },
        },
      },
    })

    return this.mapper.detailsToDto({ ...product, deletable: productInProgressDeployments === 0 })
  }

  async createProduct(request: CreateProductDto, identity: Identity): Promise<ProductListItemDto> {
    const team = await this.teamRepository.getActiveTeamByUserId(identity.id)

    const product = await this.prisma.product.create({
      data: {
        name: request.name,
        description: request.description,
        type: request.type,
        teamId: team.teamId,
        createdBy: identity.id,
        versions:
          request.type === ProductTypeEnum.simple
            ? {
                create: {
                  name: SIMPLE_PRODUCT_VERSION_NAME,
                  createdBy: identity.id,
                  type: VersionTypeEnum.rolling,
                  default: true,
                },
              }
            : undefined,
      },
    })

    return this.mapper.toDto(product)
  }

  async updateProduct(id: string, req: UpdateProductDto, identity: Identity): Promise<ProductListItemDto> {
    const currentProduct = await this.prisma.product.findUnique({
      select: {
        type: true,
      },
      where: {
        id,
      },
    })

    const product = await this.prisma.product.update({
      where: {
        id,
      },
      data: {
        name: req.name,
        description: req.description,
        updatedBy: identity.id,
        versions:
          currentProduct.type === ProductTypeEnum.simple
            ? {
                updateMany: {
                  data: {
                    changelog: req.changelog,
                  },
                  where: {
                    productId: id,
                  },
                },
              }
            : undefined,
      },
    })

    return this.mapper.toDto(product)
  }

  async deleteProduct(id: string): Promise<void> {
    await this.prisma.product.delete({
      where: {
        id,
      },
    })
  }
}
