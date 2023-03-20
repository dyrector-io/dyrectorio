import { Injectable } from '@nestjs/common'
import { Product } from '.prisma/client'
import VersionMapper, { VersionWithChildren } from '../version/version.mapper'
import { BasicProductDto, ProductDetailsDto, ProductListDto, ProductTypeDto } from './product.dto'

@Injectable()
export default class ProductMapper {
  constructor(private versionMapper: VersionMapper) {}

  productToDto(product: Product): BasicProductDto {
    return {
      ...product,
      type: ProductTypeDto[product.type],
    }
  }

  listItemToDto(products: ProductWithCounts[]): ProductListDto {
    return {
      data: products.map(({ _count, ...product }) => ({
        ...this.productToDto(product),
        versionCount: _count.versions,
      })),
    }
  }

  detailsToDto(product: ProductWithVersions): ProductDetailsDto {
    return {
      ...this.productToDto(product),
      deletable: product.deletable,
      versions: product.versions.map(it => this.versionMapper.listItemToDto(it)),
    }
  }
}

type ProductWithVersions = Product & {
  versions: VersionWithChildren[]
  deletable: boolean
}

export type ProductWithCounts = Product & {
  _count?: {
    versions: number
  }
}
