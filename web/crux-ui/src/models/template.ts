import { ProductType } from './product'

export type Template = {
  id: string
  name: string
  description: string
}

export type ApplyTemplate = Template & {
  type: ProductType
}
