import useRepatch, { RepatchAction } from '@app/hooks/use-repatch'
import {
  Compose,
  ComposeService,
  ConvertedContainer,
  DotEnvironment,
  applyDotEnvToComposeService,
  mapComposeServices,
  mapKeyValuesToRecord as mapKeyValuesToObject,
} from '@app/models'
import { composeSchema, getValidationError } from '@app/validations'
import { load } from 'js-yaml'
import { Translate } from 'next-translate'
import { Dispatch } from 'react'

export const DEFAULT_ENVIRONMENT_NAME = '.env'

export type ComposerUpperSection = 'compose' | 'generate'
export type ComposerBottomSection = 'containers' | 'environment'

type ParsedCompose = {
  text: string
  yaml?: Compose
  error?: string
}

export type ComposerState = {
  upperSection: ComposerUpperSection
  bottomSection: ComposerBottomSection
  showDefaultDotEnv: boolean
  compose: ParsedCompose
  containers: ConvertedContainer[]
  environment: DotEnvironment[]
}

type ComposerAction = RepatchAction<ComposerState>

export type ComposerDispatch = Dispatch<ComposerAction>

const initialState: ComposerState = {
  upperSection: 'compose',
  bottomSection: 'containers',
  showDefaultDotEnv: true,
  compose: null,
  containers: [],
  environment: [{ name: DEFAULT_ENVIRONMENT_NAME, environment: {} }],
}

// actions
export const activateUpperSection =
  (section: ComposerUpperSection): ComposerAction =>
  state => ({
    ...state,
    upperSection: section,
    bottomSection: section === 'generate' ? 'containers' : state.bottomSection,
  })

export const activateBottomSection =
  (section: ComposerBottomSection): ComposerAction =>
  state => ({
    ...state,
    bottomSection: section,
  })

export const toggleShowDefaultDotEnv = (): ComposerAction => state => ({
  ...state,
  showDefaultDotEnv: !state.showDefaultDotEnv,
})

const mergeDotEnvsWithServiceEnv = (envs: DotEnvironment[], serviceEnv: string[] | null): string[] | null => {
  if (envs.length < 1) {
    return serviceEnv
  }

  let merged = envs.reduce(
    (result, it) => ({
      ...result,
      ...it.environment,
    }),
    {},
  )

  if (serviceEnv) {
    const serviceEnvObj = mapKeyValuesToObject(serviceEnv)
    merged = {
      ...merged,
      ...serviceEnvObj,
    }
  }

  return Object.entries(merged).map(entry => {
    const [key, value] = entry
    return `${key}=${value}`
  })
}

const applyEnvironments = (
  composeServices: Record<string, ComposeService>,
  envs: DotEnvironment[],
): Record<string, ComposeService> => {
  const services = Object.entries(composeServices ?? {})
  const appliedServices = services.map(entry => {
    const [key, service] = entry

    const envFile: string[] = !service.env_file
      ? []
      : typeof service.env_file === 'string'
      ? [service.env_file]
      : service.env_file
    let dotEnvs = envs.filter(it => envFile.includes(it.name))

    // add explicit envs to environment
    let applied: ComposeService = {
      ...service,
      environment: mergeDotEnvsWithServiceEnv(dotEnvs, service.environment),
    }

    const defaultDotEnv = envs.find(it => it.name === DEFAULT_ENVIRONMENT_NAME)
    if (dotEnvs.length < 1 && defaultDotEnv) {
      dotEnvs = [defaultDotEnv]
    }

    dotEnvs.forEach(it => {
      applied = applyDotEnvToComposeService(applied, it.environment)
    })

    return [key, applied]
  })

  return Object.fromEntries(appliedServices)
}

type ApplyComposeToStateOptions = {
  compose: ParsedCompose
  envedCompose: Compose
  t: Translate
}
const applyComposeToState = (state: ComposerState, options: ApplyComposeToStateOptions) => {
  const { t } = options

  try {
    const newContainers = mapComposeServices(options.envedCompose)

    return {
      ...state,
      compose: options.compose,
      containers: newContainers,
    }
  } catch (err) {
    console.error(err)

    return {
      ...state,
      compose: {
        ...state.compose,
        error: t('errors.failedToParseFile', { file: t('composeFile') }),
      },
      containers: [],
    }
  }
}

export const convertComposeFile =
  (t: Translate, text: string): ComposerAction =>
  state => {
    if (!text) {
      return {
        ...state,
        compose: null,
      }
    }

    let compose: Compose = null
    try {
      compose = load(text) as Compose

      if (!compose) {
        return {
          ...state,
          compose: {
            text,
            yaml: null,
            error: null,
          },
        }
      }
    } catch (err) {
      console.error(err)

      return {
        ...state,
        compose: {
          text,
          yaml: null,
          error: t('errors.failedToParseFile', { file: t('composeFile') }),
        },
        containers: [],
      }
    }

    const error = getValidationError(composeSchema, compose, null, t)
    if (error) {
      return {
        ...state,
        compose: {
          text,
          yaml: null,
          error: error.message,
        },
      }
    }

    const envedCompose = {
      ...compose,
      services: applyEnvironments(compose?.services, state.environment),
    }

    return applyComposeToState(state, {
      compose: {
        text,
        yaml: compose,
        error: null,
      },
      envedCompose,
      t,
    })
  }

export const convertEnvFile =
  (t: Translate, target: DotEnvironment, text: string): ComposerAction =>
  state => {
    const { environment } = state

    const index = environment.findIndex(it => it === target)
    if (index < 0) {
      return state
    }

    const dotEnv: DotEnvironment = {
      ...environment[index],
    }

    try {
      const lines = text.split('\n')

      const keyValues = lines
        .filter(it => it.includes('='))
        .map(line => {
          const commentIndex = line.indexOf('#')
          if (commentIndex > -1) {
            line = line.substring(0, commentIndex).trim()
          }

          const [key, value] = line.split('=')
          return [key, value]
        })
        .filter(it => {
          const [key, value] = it
          return key && value
        })

      dotEnv.environment = Object.fromEntries(keyValues)
      dotEnv.errorMessage = null
    } catch {
      dotEnv.errorMessage = t('errors.failedToParseFile', { file: t('dotEnvFile') })
    }

    const newEnv = [...environment]
    newEnv[index] = dotEnv

    let newState = state
    const { compose } = state
    if (compose) {
      const envedCompose = {
        ...compose.yaml,
        services: applyEnvironments(compose?.yaml?.services, newEnv),
      }

      newState = applyComposeToState(state, {
        compose,
        envedCompose,
        t,
      })
    }

    return {
      ...newState,
      environment: newEnv,
    }
  }

export const changeEnvFileName =
  (target: DotEnvironment, name: string): ComposerAction =>
  state => {
    const { environment } = state

    const index = environment.findIndex(it => it === target)
    if (index < 0) {
      return state
    }

    const dotEnv: DotEnvironment = {
      ...environment[index],
      name,
    }

    const newEnv = [...environment]
    newEnv[index] = dotEnv

    return {
      ...state,
      environment: newEnv,
    }
  }

export const addEnvFile = (): ComposerAction => state => {
  const { environment } = state

  const dotEnv: DotEnvironment = {
    environment: {},
    name: `.env.${environment.length}`,
    errorMessage: null,
  }

  const newEnv = [...environment, dotEnv]

  return {
    ...state,
    bottomSection: 'environment',
    environment: newEnv,
  }
}

export const removeEnvFile =
  (t: Translate, target: DotEnvironment): ComposerAction =>
  state => {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const defaultDotEnv = selectDefaultEnvironment(state)
    if (defaultDotEnv === target) {
      return state
    }

    const { environment } = state

    const index = environment.findIndex(it => it === target)
    if (index < 0) {
      return state
    }

    const newState = {
      ...state,
      environment: environment.filter(it => it !== target),
    }

    const compose = newState.compose?.yaml
    if (!compose) {
      return newState
    }

    const envedCompose = {
      ...compose,
      services: applyEnvironments(compose.services, newState.environment),
    }

    return applyComposeToState(newState, {
      compose: newState.compose,
      envedCompose,
      t,
    })
  }

// selectors
export const selectDefaultEnvironment = (state: ComposerState) =>
  state.environment.find(it => it.name === DEFAULT_ENVIRONMENT_NAME)

export const selectShowDefaultEnvironment = (state: ComposerState) =>
  state.showDefaultDotEnv && state.bottomSection !== 'environment' && state.upperSection === 'compose'

// hook
const useComposerState = () => useRepatch(initialState)

export default useComposerState
