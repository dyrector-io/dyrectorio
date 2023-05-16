import { Inject, Injectable, forwardRef } from '@nestjs/common'
import { Product } from '.prisma/client'
import { BasicProperties } from 'src/shared/dtos/shared.dto'
import VersionMapper, { VersionWithChildren } from '../version/version.mapper'
import { ProductListItemDto, ProductDetailsDto, ProductDto, BasicProductDto } from './product.dto'
import AuditMapper from '../audit/audit.mapper'

@Injectable()
export default class ProductMapper {
  constructor(
    @Inject(forwardRef(() => VersionMapper))
    private versionMapper: VersionMapper,
    private auditMapper: AuditMapper,
  ) {}

  toDto(it: Product): ProductDto {
    return {
      id: it.id,
      name: it.name,
      type: it.type,
      audit: this.auditMapper.toDto(it),
      description: it.description,
    }
  }

  toBasicDto(it: Pick<Product, BasicProperties>): BasicProductDto {
    return {
      id: it.id,
      name: it.name,
      type: it.type,
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
