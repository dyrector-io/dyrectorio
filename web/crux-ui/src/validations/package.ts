import { descriptionRule, iconRule, nameRule } from './common'
import { prefixRule } from './deployment'
import yup from './yup'

export const packageSchema = yup.object().shape({
  name: nameRule.required(),
  description: descriptionRule,
  icon: iconRule,
  chainIds: yup.array(yup.string()).label('versionChains'),
})

export const packageEnvironmentSchema = yup.object().shape({
  name: nameRule.required(),
  nodeId: yup.string().required().label('common:node'),
  prefix: prefixRule,
})
