import { Injectable } from '@nestjs/common'
import { Product } from '.prisma/client'
import VersionMapper, { VersionWithChildren } from '../version/version.mapper'
import { ProductListItemDto, ProductDetailsDto, ProductDto } from './product.dto'
import SharedMapper from '../shared/shared.mapper'

@Injectable()
export default class ProductMapper {
  constructor(private sharedMapper: SharedMapper, private versionMapper: VersionMapper) {}

  toDto(it: Product): ProductDto {
    return {
      id: it.id,
      name: it.name,
      type: it.type,
      audit: this.sharedMapper.auditToDto(it),
      description: it.description,
    }
  }

  toListItemDto(it: ProductWithCount): ProductListItemDto {
    return {
      ...this.toDto(it),
      versionCount: it._count.versions,
    }
  }

  detailsToDto(product: ProductWithVersions): ProductDetailsDto {
    return {
      ...this.toDto(product),
      deletable: product.deletable,
      versions: product.versions.map(it => this.versionMapper.toDto(it)),
    }
  }
}

type ProductWithVersions = Product & {
  versions: VersionWithChildren[]
  deletable: boolean
}

export type ProductWithCount = Product & {
  _count: {
    versions: number
  }
}
