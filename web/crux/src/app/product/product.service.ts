import { Injectable } from '@nestjs/common'
import { ProductTypeEnum, VersionTypeEnum } from '@prisma/client'
import { IdRequest, ProductDetailsReponse, UpdateEntityResponse } from 'src/grpc/protobuf/proto/crux'
import { SIMPLE_PRODUCT_VERSION_NAME } from 'src/shared/const'
import PrismaService from 'src/services/prisma.service'
import { Identity } from '@ory/kratos-client'
import TeamRepository from '../team/team.repository'
import ProductMapper from './product.mapper'
import { CreateProductDto, ProductListDto, ProductsDto, ProductTypeDto } from './product.dto'

@Injectable()
export default class ProductService {
  constructor(private teamRepository: TeamRepository, private prisma: PrismaService, private mapper: ProductMapper) {}

  async getProducts(identity: Identity): Promise<ProductListDto> {
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

  async createProduct(request: CreateProductDto, identity: Identity): Promise<ProductsDto> {
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

    console.log(product)

    return this.mapper.productToDto(product)
  }

  async updateProduct(id: string, req: CreateProductDto, identity: Identity): Promise<UpdateEntityResponse> {
    let product = await this.prisma.product.findUnique({
      select: {
        type: true,
      },
      where: {
        id,
      },
    })

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
                    changelog: req.changelog, // TODO!!
                  },
                  where: {
                    productId: id,
                  },
                },
              }
            : undefined,
      },
    })

    return UpdateEntityResponse.fromJSON(product)
  }

  async deleteProduct(request: IdRequest): Promise<void> {
    // TODO Have to delete all releations regarding to this product eg.: versions, deployments, images
    // @Levente: We should check cascades for this
    await this.prisma.product.delete({
      where: {
        id: request.id,
      },
    })
  }

  async getProductDetails(request: IdRequest): Promise<ProductDetailsReponse> {
    const product = await this.prisma.product.findUniqueOrThrow({
      where: { id: request.id },
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
        id: request.id,
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

    return this.mapper.detailsToProto({ ...product, deletable: productInProgressDeployments === 0 })
  }
}
