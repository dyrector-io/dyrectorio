import { Product, ProductTypeEnum } from '.prisma/client'
import { Injectable } from '@nestjs/common'
import {
  AuditResponse,
  ProductDetailsReponse,
  ProductReponse,
  ProductType as GrpcProductType,
  productTypeFromJSON,
  productTypeToJSON,
} from 'src/proto/proto/crux'
import { VersionMapper, VersionWithChildren } from '../version/version.mapper'

@Injectable()
export class ProductMapper {
  constructor(private versionMapper: VersionMapper) {}

  toGrpc(product: Product): ProductReponse {
    return {
      ...product,
      audit: AuditResponse.fromJSON(product),
      type: this.typeToGrpc(product.type),
    }
  }

  detailsToGrpc(product: ProductWithVersions): ProductDetailsReponse {
    return {
      ...product,
      audit: AuditResponse.fromJSON(product),
      type: this.typeToGrpc(product.type),
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
}
