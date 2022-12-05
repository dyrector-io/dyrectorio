import { Injectable, Logger } from '@nestjs/common'
import { ProductTypeEnum, VersionTypeEnum } from '@prisma/client'
import { Empty } from 'src/grpc/protobuf/proto/common'
import {
  AccessRequest,
  CreateEntityResponse,
  CreateProductRequest,
  IdRequest,
  ProductDetailsReponse,
  ProductListResponse,
  UpdateEntityResponse,
  UpdateProductRequest,
} from 'src/grpc/protobuf/proto/crux'
import { SIMPLE_PRODUCT_VERSION_NAME } from 'src/shared/const'
import PrismaService from 'src/services/prisma.service'
import TeamRepository from '../team/team.repository'
import ProductMapper from './product.mapper'

@Injectable()
export default class ProductService {
  constructor(private teamRepository: TeamRepository, private prisma: PrismaService, private mapper: ProductMapper) {}

  private readonly logger = new Logger(ProductService.name)

  async getProducts(request: AccessRequest): Promise<ProductListResponse> {
    const products = await this.prisma.product.findMany({
      where: {
        team: {
          users: {
            some: {
              userId: request.accessedBy,
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

    return {
      data: products.map(it => this.mapper.toGrpc(it)),
    }
  }

  async createProduct(request: CreateProductRequest): Promise<CreateEntityResponse> {
    const type = this.mapper.typeToDb(request.type)
    const team = await this.teamRepository.getActiveTeamByUserId(request.accessedBy)

    const product = await this.prisma.product.create({
      data: {
        name: request.name,
        description: request.description,
        type,
        teamId: team.teamId,
        createdBy: request.accessedBy,
        versions:
          type === ProductTypeEnum.simple
            ? {
                create: {
                  name: SIMPLE_PRODUCT_VERSION_NAME,
                  createdBy: request.accessedBy,
                  type: VersionTypeEnum.rolling,
                  default: true,
                },
              }
            : undefined,
      },
    })

    return CreateEntityResponse.fromJSON(product)
  }

  async updateProduct(req: UpdateProductRequest): Promise<UpdateEntityResponse> {
    let product = await this.prisma.product.findUnique({
      select: {
        type: true,
      },
      where: {
        id: req.id,
      },
    })

    product = await this.prisma.product.update({
      where: {
        id: req.id,
      },
      data: {
        name: req.name,
        description: req.description,
        updatedBy: req.accessedBy,
        versions:
          product.type === ProductTypeEnum.simple
            ? {
                updateMany: {
                  data: {
                    changelog: req.changelog,
                  },
                  where: {
                    productId: req.id,
                  },
                },
              }
            : undefined,
      },
    })

    return UpdateEntityResponse.fromJSON(product)
  }

  async deleteProduct(request: IdRequest): Promise<Empty> {
    // TODO Have to delete all releations regarding to this product eg.: versions, deployments, images
    // @Levente: We should check cascades for this
    await this.prisma.product.delete({
      where: {
        id: request.id,
      },
    })

    return Empty
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

    return this.mapper.detailsToGrpc({ ...product, deletable: productInProgressDeployments === 0 })
  }
}
