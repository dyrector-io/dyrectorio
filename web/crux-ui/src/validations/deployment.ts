import * as yup from 'yup'
import { nameRule } from './common'

const prefixRule = yup
  .string()
  .trim()
  .matches(/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/) // RFC 1123
  .required()

export const updateDeploymentSchema = yup.object().shape({
  note: yup.string(),
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
  expirationInDays: yup.number().nullable(),
})

export const createFullDeploymentSchema = yup.object().shape({
  nodeId: yup.string().required(),
  prefix: prefixRule,
  versionId: yup.string().required(),
  projectId: yup.string().required(),
  note: yup.string().nullable().optional(),
})
