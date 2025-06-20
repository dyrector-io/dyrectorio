import { ConfigModuleOptions } from '@nestjs/config'
import * as yup from 'yup'

const LOG_LEVEL_VALUES = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const
export type PinoLogLevel = (typeof LOG_LEVEL_VALUES)[number]

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
  CRUX_AGENT_IMAGE: yup.string(),
  AGENT_INSTALL_SCRIPT_DISABLE_PULL: yup.bool().default(false).required(),

  LOG_LEVEL: yup.string().oneOf(LOG_LEVEL_VALUES).required(),

  SMTP_URI: yup.string().required(),
  FROM_EMAIL: yup.string().email().required(),
  FROM_NAME: yup.string().required(),

  DISABLE_RECAPTCHA: yup.bool().default(false).required(),
  DISABLE_REGISTRY_LABEL_FETCHING: yup.bool().default(false).required(),
  DISABLE_TEAM_CREATION: yup.bool().default(false).required(),
  RECAPTCHA_SECRET_KEY: yup.string().when('DISABLE_RECAPTCHA', {
    is: disabled => disabled,
    otherwise: schema => schema.required(),
  }),

  DNS_DEFAULT_RESULT_ORDER: yup.string().oneOf(['ipv4first', 'verbatim']).default('verbatim').required(),

  QA_OPT_OUT: yup.bool().default(false).required(),
  QA_GROUP_NAME: yup.string().optional(),

  MAX_CONTAINER_LOG_TAKE: yup.number().optional(),
  AGENT_CALLBACK_TIMEOUT: yup.number().positive().optional(),
  MAX_GRPC_RECEIVE_MESSAGE_LENGTH: yup.number().positive().optional(),

  GRPC_KEEPALIVE_TIMEOUT_MS: yup.number().positive().min(1000).optional(), // 5000
  GRPC_KEEPALIVE_TIME_MS: yup.number().positive().min(10000).optional(), // 30000
  HTTP2_MINPINGINTERVAL_MS: yup.number().positive().min(5000).optional(), // 30000
  HTTP2_MINTIMEBETWEENPINGS_MS: yup.number().positive().min(1000).optional(), // 10000
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
