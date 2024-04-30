import {
  COMPOSE_LOG_DRIVER_VALUES,
  COMPOSE_NETWORK_MODE_VALUES,
  COMPOSE_RESTART_VALUES,
  COMPOSE_TARGET_TYPE_VALUES,
  ComposeLogDriver,
  ComposeNetworkMode,
  ComposeRestart,
  ComposeTargetType,
  VERSION_TYPE_VALUES,
  VersionType,
} from '@app/models'
import * as yup from 'yup'
import { matchValues, nameRule, portRule, stringArrayRule } from './common'

const mixedStringOrStringArrayRule = yup.mixed<string | string[]>().when({
  is: it => typeof it === 'string',
  then: () => yup.string(),
  otherwise: () => stringArrayRule,
})

export const composeNamedNetworkSchema = yup.object().shape({
  name: yup.string().optional().nullable(),
  external: yup.bool().optional().nullable(),
})

export const composeNamedVolumeSchema = composeNamedNetworkSchema

export const composeServiceSchema = yup.object().shape({
  container_name: yup.string().optional().nullable(),
  image: yup.string(),
  environment: yup.array().of(yup.string().test('environment', 'Invalid environment', it => it.includes('='))),
  entrypoint: mixedStringOrStringArrayRule.label('compose:entrypoint').optional().nullable(),
  command: mixedStringOrStringArrayRule.label('container:common.command').optional().nullable(),
  ports: yup
    .array()
    .of(
      yup.mixed<string | number>().when({
        is: it => typeof it === 'string',
        then: () => yup.string(),
        otherwise: () => portRule,
      }),
    )
    .optional()
    .nullable(),
  volumes: stringArrayRule.label('container:common.volumes').optional().nullable(),
  restart: yup.mixed<ComposeRestart>().oneOf(COMPOSE_RESTART_VALUES).optional().nullable(),
  labels: stringArrayRule.label('container:crane.labels').optional().nullable(),
  network_mode: yup.mixed<ComposeNetworkMode>().oneOf(COMPOSE_NETWORK_MODE_VALUES).optional().nullable(),
  networks: stringArrayRule.label('container:dagent.networks').optional().nullable(),
  logging: yup
    .object()
    .shape({
      driver: yup.mixed<ComposeLogDriver>().oneOf(COMPOSE_LOG_DRIVER_VALUES).optional().nullable(),
      options: matchValues('logging.options', 'Invalid logging options', yup.string()),
    })
    .optional()
    .nullable(),
  tty: yup.bool().optional().nullable(),
  working_dir: yup.string().optional().nullable(),
  user: yup.string().transform(it => {
    if (Number.isNaN(it)) {
      throw new yup.ValidationError('Invalid user')
    }

    return it
  }),
  env_file: yup.string().optional().nullable(),
})

export const composeSchema = yup.object().shape({
  services: matchValues('services', '`services` must be an object', composeServiceSchema),
})

export const generateVersionSchema = yup.object().shape({
  targetType: yup.mixed<ComposeTargetType>().oneOf(COMPOSE_TARGET_TYPE_VALUES),
  versionName: nameRule,
  versionType: yup.mixed<VersionType>().oneOf(VERSION_TYPE_VALUES),
  projectName: nameRule.when('targetType', {
    is: it => it === 'existing-project',
    then: s => s.optional().nullable(),
    otherwise: s => s.required(),
  }),
  project: yup.object().when('targetType', {
    is: it => it === 'existing-project',
    then: s => s.required(),
    otherwise: s => s.optional().nullable(),
  }),
})
