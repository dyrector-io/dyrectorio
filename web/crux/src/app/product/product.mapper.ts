import { Injectable } from '@nestjs/common'
import {
  AuditResponse,
  ProductDetailsReponse,
  ProductReponse,
  ProductType as GrpcProductType,
  productTypeFromJSON,
  productTypeToJSON,
} from 'src/grpc/protobuf/proto/crux'
import { Product, ProductTypeEnum } from '.prisma/client'
import VersionMapper, { VersionWithChildren } from '../version/version.mapper'

@Injectable()
export default class ProductMapper {
  constructor(private versionMapper: VersionMapper) {}

  toGrpc(product: ProductWithCounts): ProductReponse {
    return {
      ...product,
      audit: AuditResponse.fromJSON(product),
      type: this.typeToGrpc(product.type),
      versionCount: product._count.versions,
    }
  }

  detailsToGrpc(product: ProductWithVersions): ProductDetailsReponse {
    return {
      ...product,
      audit: AuditResponse.fromJSON(product),
      type: this.typeToGrpc(product.type),
      deletable: product.deletable,
      versions: product.versions.map(it => this.versionMapper.toGrpc(it)),
    }
  }

  typeToDb(type: GrpcProductType): ProductTypeEnum {
    return productTypeToJSON(type).toLowerCase() as ProductTypeEnum
  }

  typeToGrpc(type: ProductTypeEnum): GrpcProductType {
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
