import { NodeType, NODE_TYPE_VALUES } from '@app/models/node'
import * as yup from 'yup'
import { descriptionRule, iconRule, nameRule } from './common'

export const nodeSchema = yup.object().shape({
  name: nameRule,
  description: descriptionRule,
  icon: iconRule,
  type: yup.mixed<NodeType>().oneOf([...NODE_TYPE_VALUES]),
})

export const nodeType = yup.object().shape({
  type: yup.mixed<NodeType>().oneOf([...NODE_TYPE_VALUES]),
})
