import * as yup from 'yup'

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

export const copyDeploymentSchema = createDeploymentSchema

export const createDeploymentTokenSchema = yup.object().shape({
  expirationInDays: yup.number().nullable(),
})
