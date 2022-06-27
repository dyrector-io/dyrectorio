import { InvalidArgumentException } from 'src/exception/errors'
import * as yup from 'yup'
import { ExplicitContainerNetworkMode, EXPLICIT_CONTAINER_NETWORK_MODE_VALUES } from './model'

export const uniqueKeyValuesSchema = yup
  .array(
    yup.object().shape({
      key: yup.string().required().ensure().matches(/^\S+$/g), // all characters are non-whitespaces
      value: yup.string().ensure(),
    }),
  )
  .ensure()
  .test('keysAreUnique', 'Keys must be unique', arr => new Set(arr.map(it => it.key)).size === arr.length)

const portNumberRule = yup.number().positive().lessThan(65536).required()

export const explicitContainerConfigSchema = yup.object().shape({
  ports: yup
    .array(
      yup.object().shape({
        internal: portNumberRule,
        external: portNumberRule,
      }),
    )
    .default([]),
  mounts: yup.array(yup.string()).default([]),
  networkMode: yup
    .mixed<ExplicitContainerNetworkMode>()
    .oneOf([...EXPLICIT_CONTAINER_NETWORK_MODE_VALUES])
    .default('none'),
  expose: yup.array(
    yup
      .object()
      .shape({
        public: yup.boolean().required(),
        tls: yup.boolean().required(),
      })
      .default([]),
  ),
  user: yup.number().positive().nullable().default(null),
})

export const containerConfigSchema = yup.object({
  environment: uniqueKeyValuesSchema,
  capabilities: uniqueKeyValuesSchema,
  config: explicitContainerConfigSchema,
})

export const deploymentSchema = yup.object({
  environment: uniqueKeyValuesSchema,
  instances: yup.array(
    yup.object({
      config: containerConfigSchema.nullable(),
      image: yup.object({
        config: containerConfigSchema,
      }),
    }),
  ),
})

export const yupValidate = (schema: yup.AnySchema, candidate: any) => {
  try {
    schema.validateSync(candidate)
  } catch (error) {
    const validationError = error as yup.ValidationError
    throw new InvalidArgumentException({
      message: 'Validation failed',
      property: validationError.path,
      value: validationError.errors,
    })
  }
}
