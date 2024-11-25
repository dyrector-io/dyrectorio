import { NodeInstallScriptType, NodeType, NODE_INSTALL_SCRIPT_TYPE_VALUES, NODE_TYPE_VALUES } from '@app/models'
import yup from './yup'
import { descriptionRule, iconRule, nameRule } from './common'

export const nodeSchema = yup.object().shape({
  name: nameRule,
  description: descriptionRule,
  icon: iconRule,
})

export const nodeGenerateScriptSchema = yup.object().shape({
  type: yup
    .mixed<NodeType>()
    .oneOf([...NODE_TYPE_VALUES])
    .required()
    .label('nodes:technology'),
  rootPath: yup.string().label('nodes:persistentDataPath'),
  scriptType: yup
    .mixed<NodeInstallScriptType>()
    .oneOf([...NODE_INSTALL_SCRIPT_TYPE_VALUES])
    .required()
    .label('nodes:type'),
  dagentTraefik: yup
    .object()
    .shape({
      acmeEmail: yup.string().email().required().label('nodes:traefikAcmeEmail'),
    })
    .nullable()
    .default(null),
  workloadName: yup.string().label('nodes:containerName'),
})
