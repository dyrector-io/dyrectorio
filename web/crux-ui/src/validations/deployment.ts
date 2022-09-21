import * as yup from 'yup'
import { explicitContainerConfigSchema, uniqueKeyValuesSchema } from './container'
import { imageSchema } from './image'

export const updateDeploymentSchema = yup.object().shape({
  note: yup.string(),
  prefix: yup
    .string()
    .trim()
    .matches(/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/) // RFC 1123
    .required(),
})

export const createDeploymentSchema = updateDeploymentSchema.concat(
  yup.object().shape({
    nodeId: yup.mixed().nullable().required().label('node'),
  }),
)

export const deploymentSchema = yup.object().shape({
  environment: uniqueKeyValuesSchema,
  instances: yup.array(
    yup.object().shape({
      image: imageSchema,
      overriddenConfig: explicitContainerConfigSchema.nullable(),
    }),
  ),
})
