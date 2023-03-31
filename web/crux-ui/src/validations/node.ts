import { NodeInstallScriptType, NodeType, NODE_INSTALL_SCRIPT_TYPE_VALUES, NODE_TYPE_VALUES } from '@app/models/node'
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

export const nodeGenerateScriptSchema = yup.object().shape({
  type: yup
    .mixed<NodeType>()
    .oneOf([...NODE_TYPE_VALUES])
    .required(),
  rootPath: yup.string(),
  scriptType: yup
    .mixed<NodeInstallScriptType>()
    .oneOf([...NODE_INSTALL_SCRIPT_TYPE_VALUES])
    .required(),
  traefik: yup
    .object()
    .shape({
      acmeEmail: yup.string().email().required().label('ACME email'),
    })
    .nullable()
    .default(null),
})
