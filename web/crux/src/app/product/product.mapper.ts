import { Injectable } from '@nestjs/common'
import {
  AuditResponse,
  ProductDetailsReponse,
  ProductType as GrpcProductType,
  productTypeFromJSON,
  productTypeToJSON,
} from 'src/grpc/protobuf/proto/crux'
import { Product, ProductTypeEnum } from '.prisma/client'
import VersionMapper, { VersionWithChildren } from '../version/version.mapper'
import { ProductListDto, ProductsDto, ProductTypeDto } from './product.dto'

@Injectable()
export default class ProductMapper {
  constructor(private versionMapper: VersionMapper) {}

  productToDto(product: Product): ProductsDto {
    const { description, ...rest } = product
    return {
      ...rest,
      type: ProductTypeDto[rest.type],
      description: description ?? undefined,
    }
  }

  listItemToDto(products: ProductWithCounts[]): ProductListDto {
    return {
      data: products.map(({ _count, ...product }) => ({
        ...this.productToDto(product),
        type: ProductTypeDto[product.type],
        versionCount: _count.versions,
      })),
    }
  }

  detailsToProto(product: ProductWithVersions): ProductDetailsReponse {
    return {
      ...product,
      audit: AuditResponse.fromJSON(product),
      type: this.typeToProto(product.type),
      deletable: product.deletable,
      versions: product.versions.map(it => this.versionMapper.listItemToProto(it)),
    }
  }

  typeToDb(type: GrpcProductType): ProductTypeEnum {
    return productTypeToJSON(type).toLowerCase() as ProductTypeEnum
  }

  typeToProto(type: ProductTypeEnum): GrpcProductType {
    return productTypeFromJSON(type.toUpperCase())
  }
}

type ProductWithVersions = Product & {
  versions: VersionWithChildren[]
  deletable: boolean
}

export type ProductWithCounts = Product & {
  _count: {
    versions: number
  }
}
