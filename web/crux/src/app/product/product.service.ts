import { Injectable } from '@nestjs/common'
import { Product, ProductTypeEnum, VersionTypeEnum } from '@prisma/client'
import { SIMPLE_PRODUCT_VERSION_NAME } from 'src/shared/const'
import PrismaService from 'src/services/prisma.service'
import { Identity } from '@ory/kratos-client'
import TeamRepository from '../team/team.repository'
import ProductMapper from './product.mapper'
import { CreateProductDto, ProductTypeDto, ProductDto, ProductDetailsDto, UpdateProductDto } from './product.dto'

@Injectable()
export default class ProductService {
  constructor(private teamRepository: TeamRepository, private prisma: PrismaService, private mapper: ProductMapper) {}

  async getProducts(identity: Identity): Promise<ProductDto[]> {
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

    return this.mapper.listItemToDto(products)
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

  async createProduct(request: CreateProductDto, identity: Identity): Promise<ProductDto> {
    const type = ProductTypeDto[request.type]
    const team = await this.teamRepository.getActiveTeamByUserId(identity.id)

    const product = await this.prisma.product.create({
      data: {
        name: request.name,
        description: request.description,
        type,
        teamId: team.teamId,
        createdBy: identity.id,
        versions:
          type === ProductTypeEnum.simple
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

    return this.mapper.productToDto(product)
  }

  async updateProduct(id: string, req: UpdateProductDto, identity: Identity): Promise<ProductDto> {
    let product = (await this.prisma.product.findUnique({
      select: {
        type: true,
      },
      where: {
        id,
      },
    })) as Product

    product = await this.prisma.product.update({
      where: {
        id,
      },
      data: {
        name: req.name,
        description: req.description,
        updatedBy: identity.id,
        versions:
          product.type === ProductTypeEnum.simple
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

    return this.mapper.productToDto(product)
  }

  async deleteProduct(id: string): Promise<void> {
    // TODO Have to delete all releations regarding to this product eg.: versions, deployments, images
    // @Levente: We should check cascades for this
    await this.prisma.product.delete({
      where: {
        id,
      },
    })
  }
}
