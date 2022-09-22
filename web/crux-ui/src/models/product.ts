import { Version } from './version'

export const PRODUCT_TYPE_VALUES = ['simple', 'complex'] as const
export type ProductType = typeof PRODUCT_TYPE_VALUES[number]

export type Product = {
  id: string
  name: string
  description?: string
  type: ProductType
  updatedAt: string
}

export type EditableProduct = Product & {
  changelog?: string
}

export type ProductDetails = Product & {
  createdAt: string
  versions: Version[]
}

export type UpdateProduct = {
  name: string
  description?: string
  changelog?: string
}

export type CreateProduct = UpdateProduct & {
  type: ProductType
}

export const productDetailsToEditableProduct = (product: ProductDetails) =>
  ({
    ...product,
    changelog: product.type === 'simple' ? product.versions[0].changelog : null,
  } as EditableProduct)

export const updateProductDetailsWithEditableProduct = (product: ProductDetails, edit: EditableProduct) => {
  const newProduct = {
    ...product,
    ...edit,
  }

  if (product.type === 'simple') {
    const version = product.versions[0]

    newProduct.versions = [
      {
        ...version,
        changelog: edit.changelog,
      },
    ]
  }

  return newProduct
}
