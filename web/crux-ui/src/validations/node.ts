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

const baseNodeInstallScriptSchema = yup.object().shape({
  type: yup
    .mixed<NodeType>()
    .oneOf([...NODE_TYPE_VALUES])
    .required(),
  rootPath: yup.string(),
  scriptType: yup
    .mixed<NodeInstallScriptType>()
    .oneOf([...NODE_INSTALL_SCRIPT_TYPE_VALUES])
    .required(),
})

export const nodeInstallScriptFormSchema = baseNodeInstallScriptSchema.shape({
  traefik: yup.bool().required(),
  traefikAcmeEmail: yup
    .mixed()
    .label('ACME email')
    .when(['traefik'], {
      is: traefik => traefik,
      then: yup.string().email().required(),
      otherwise: yup.string(),
    }),
})

export const nodeGenerateScriptSchema = baseNodeInstallScriptSchema.shape({
  traefik: yup
    .object()
    .shape({
      acmeEmail: yup.string().email().required(),
    })
    .default(undefined),
})
