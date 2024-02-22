import { ConfigModuleOptions } from '@nestjs/config'
import * as yup from 'yup'

const portRule = yup.number().positive().min(1).max(65565)
const encryptionKeyRule = yup.string().length(43)

const configSchema = yup.object({
  NODE_ENV: yup.string().oneOf(['production', 'development']).default('development').required(),

  KRATOS_URL: yup.string().required(),
  KRATOS_ADMIN_URL: yup.string().required(),
  DATABASE_URL: yup.string().required(),
  CRUX_UI_URL: yup.string().required(),

  GRPC_AGENT_PORT: portRule.default(5000).required(),
  HTTP_API_PORT: portRule.default(1848).required(),
  METRICS_API_PORT: portRule.nullable().default(null).optional(),

  JWT_SECRET: yup.string().min(16).required(),
  ENCRYPTION_SECRET_KEY: encryptionKeyRule.required(
    'Invalid or missing env: ENCRYPTION_SECRET_KEY; You can generate a one with `docker run --rm ghcr.io/dyrector-io/dyrectorio/cli/dyo:latest generate crux encryption-key`',
  ),
  ENCRYPTION_DEPRECATED_KEY: encryptionKeyRule.optional(),

  CRUX_AGENT_ADDRESS: yup.string().required(),
  CRUX_AGENT_IMAGE: yup.string().default('latest').required(),
  AGENT_INSTALL_SCRIPT_DISABLE_PULL: yup.bool().default(false).required(),

  LOG_LEVEL: yup.string().oneOf(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).required(),

  SMTP_URI: yup.string().required(),
  FROM_EMAIL: yup.string().email().required(),
  FROM_NAME: yup.string().required(),

  DISABLE_RECAPTCHA: yup.bool().default(false).required(),
  RECAPTCHA_SECRET_KEY: yup.string().when('DISABLE_RECAPTCHA', {
    is: disabled => disabled,
    otherwise: schema => schema.required(),
  }),

  DNS_DEFAULT_RESULT_ORDER: yup.string().oneOf(['ipv4first', 'verbatim']).default('verbatim').required(),

  QA_OPT_OUT: yup.bool().default(false).required(),
  QA_GROUP_NAME: yup.string().optional(),

  DEFAULT_CONTAINER_LOG_TAIL: yup.number().optional(),
})

class InvalidEnvironmentError extends Error {
  constructor(error: yup.ValidationError) {
    const message = error.errors.reduce((result, it) => `${result}${it}\n`, '\n')
    super(message)

    this.stack = null
  }
}

const validate = (config: Record<string, any>): Record<string, any> => {
  if (process.argv.length > 2 && process.argv[2] === 'encrypt') {
    return config
  }

  try {
    configSchema.validateSync(config, {
      abortEarly: false,
    })
  } catch (err) {
    const error: yup.ValidationError = err as yup.ValidationError
    throw new InvalidEnvironmentError(error)
  }

  return configSchema.cast(config)
}

const appConfig: ConfigModuleOptions = {
  isGlobal: true,
  cache: true,
  validate,
}

export default appConfig
