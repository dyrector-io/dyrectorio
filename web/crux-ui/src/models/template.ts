import { ProductType } from './product'

export type Template = {
  id: string
  name: string
  description: string
  technologies: Array<string>
}

export type ApplyTemplate = Omit<Template, 'technologies'> & {
  type: ProductType
}
