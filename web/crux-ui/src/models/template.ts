import { ProductType } from './product'

export type Template = {
  id: string
  name: string
  description?: string
  technologies: string[]
}

export type CreateProductFromTemplate = Omit<Template, 'technologies'> & {
  type: ProductType
}
