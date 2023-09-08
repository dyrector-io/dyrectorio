import yup from './yup'
import { nameRule } from './common'
import { mergedContainerConfigSchema, uniqueKeyValuesSchema } from './container'

const prefixRule = yup
  .string()
  .trim()
  .matches(/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/) // RFC 1123
  .required()
  .label('common:prefix')

export const updateDeploymentSchema = yup.object().shape({
  note: yup.string().label('common:note'),
  prefix: prefixRule,
})

export const createDeploymentSchema = updateDeploymentSchema.concat(
  yup.object().shape({
    nodeId: yup.mixed().nullable().required().label('node'),
  }),
)

export const copyDeploymentSchema = createDeploymentSchema

export const createDeploymentTokenSchema = yup.object().shape({
  name: nameRule,
  expirationInDays: yup.number().nullable().label('tokens:expirationIn'),
})

export const createFullDeploymentSchema = yup.object().shape({
  nodeId: yup.string().required(),
  prefix: prefixRule,
  versionId: yup.string().required().label('common:versions'),
  projectId: yup.string().required().label('common:projects'),
  note: yup.string().nullable().optional().label('common:note'),
})

export const startDeploymentSchema = yup.object({
  environment: uniqueKeyValuesSchema,
  instances: yup
    .array(
      yup.object().shape({
        config: mergedContainerConfigSchema,
      }),
    )
    .ensure()
    .test(
      'containerNameAreUnique',
      'Container names must be unique',
      instances => new Set(instances.map(it => it.config.name)).size === instances.length,
    ),
})
