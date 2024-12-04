import { nameRule } from './common'
import { createConcreteContainerConfigSchema, uniqueKeyValuesSchema } from './container'
import yup from './yup'

export const prefixRule = yup
  .string()
  .trim()
  .matches(/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/) // RFC 1123
  .required()
  .label('common:prefix')

const noteRule = yup.string().optional().nullable().label('common:note')
const nodeIdRule = yup.string().nullable().required().label('common:node')

export const updateDeploymentSchema = yup.object().shape({
  note: noteRule,
  prefix: prefixRule,
  protected: yup.bool().required(),
})

export const createDeploymentSchema = updateDeploymentSchema.concat(
  yup.object().shape({
    nodeId: nodeIdRule,
  }),
)

export const copyDeploymentSchema = yup.object().shape({
  note: noteRule,
  prefix: prefixRule,
  nodeId: nodeIdRule,
})

export const createDeploymentTokenSchema = yup.object().shape({
  name: nameRule,
  expirationInDays: yup.number().nullable().label('tokens:expirationIn'),
})

export const createFullDeploymentSchema = yup.object().shape({
  node: yup.object().required().label('common:node'),
  prefix: prefixRule,
  versionId: yup.string().required().label('common:versions'),
  project: yup.object().required().label('common:projects'),
  note: yup.string().nullable().optional().label('common:note'),
})

export const startDeploymentSchema = yup.object({
  environment: uniqueKeyValuesSchema,
  instances: yup
    .array(
      yup.object().shape({
        config: createConcreteContainerConfigSchema(null),
      }),
    )
    .ensure()
    .test(
      'containerNameAreUnique',
      'Container names must be unique',
      instances => new Set(instances.map(it => it.config.name)).size === instances.length,
    ),
})

export const validationErrorToInstance = (field: string): number => {
  const indexMatch = field?.match(/^instances\[(?<instance>.*)\]/)?.groups?.instance
  return indexMatch ? Number.parseInt(indexMatch, 10) : null
}
