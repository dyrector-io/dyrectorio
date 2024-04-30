import useRepatch, { RepatchAction } from '@app/hooks/use-repatch'
import {
  Compose,
  ComposeService,
  ConvertedContainer,
  DotEnvironment,
  applyDotEnvToComposeService,
  mapComposeServices,
} from '@app/models'
import { composeSchema, getValidationError } from '@app/validations'
import { load } from 'js-yaml'
import { Translate } from 'next-translate'
import { Dispatch } from 'react'

export const DEFAULT_ENVIRONMENT_NAME = '.env'

export type ComposerUpperSection = 'compose' | 'generate'
export type ComposerBottomSection = 'containers' | 'environment'

export type ComposerState = {
  upperSection: ComposerUpperSection
  bottomSection: ComposerBottomSection
  showDefaultDotEnv: boolean
  compose?: Compose
  composeError?: string
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
  composeError: null,
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

const applyEnvironments = (
  composeServices: Record<string, ComposeService>,
  envs: DotEnvironment[],
): Record<string, ComposeService> => {
  const services = Object.entries(composeServices ?? {})
  const appliedServices = services.map(entry => {
    const [key, service] = entry

    const dotEnvName = service.env_file ?? DEFAULT_ENVIRONMENT_NAME
    const dotEnv = envs.find(it => it.name === dotEnvName)

    const applied = applyDotEnvToComposeService(service, dotEnv.environment)

    return [key, applied]
  })

  return Object.fromEntries(appliedServices)
}

type ApplyComposeToStateOptions = {
  originalCompose: Compose
  envedCompose: Compose
  t: Translate
}
const applyComposeToState = (state: ComposerState, options: ApplyComposeToStateOptions) => {
  const { t } = options

  try {
    const newContainers = mapComposeServices(options.envedCompose)

    return {
      ...state,
      compose: options.originalCompose,
      composeError: null,
      containers: newContainers,
    }
  } catch (err) {
    console.error(err)

    return {
      ...state,
      compose: null,
      composeError: t('errors.failedToParseFile', { file: t('composeFile') }),
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
        composeError: null,
      }
    }

    let compose: Compose = null
    try {
      compose = load(text) as Compose

      if (!compose) {
        return {
          ...state,
          compose: null,
          composeError: null,
        }
      }
    } catch (err) {
      console.error(err)

      return {
        ...state,
        compose: null,
        composeError: t('errors.failedToParseFile', { file: t('composeFile') }),
        containers: [],
      }
    }

    const error = getValidationError(composeSchema, compose, null, t)
    if (error) {
      return {
        ...state,
        compose: null,
        composeError: error.message,
      }
    }

    const envedCompose = {
      ...compose,
      services: applyEnvironments(compose?.services, state.environment),
    }

    return applyComposeToState(state, {
      originalCompose: compose,
      envedCompose,
      t,
    })
  }

export const convertEnvFile =
  (t: Translate, name: string, text: string): ComposerAction =>
  state => {
    const { environment } = state

    const index = environment.findIndex(it => it.name === name)
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

    const { compose } = state

    const envedCompose = {
      ...compose,
      services: applyEnvironments(compose?.services, newEnv),
    }

    const newState = applyComposeToState(state, {
      originalCompose: compose,
      envedCompose,
      t,
    })

    return {
      ...newState,
      environment: newEnv,
    }
  }

export const changeEnvFileName =
  (from: string, to: string): ComposerAction =>
  state => {
    const { environment } = state

    const index = environment.findIndex(it => it.name === from)
    if (index < 0) {
      return state
    }

    const dotEnv: DotEnvironment = {
      ...environment[index],
      name: to,
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
  (name: string): ComposerAction =>
  state => {
    if (name === DEFAULT_ENVIRONMENT_NAME) {
      return state
    }

    const { environment } = state

    const index = environment.findIndex(it => it.name === name)
    if (index < 0) {
      return state
    }

    return {
      ...state,
      environment: environment.filter(it => it.name !== name),
    }
  }

// selectors
export const selectDefaultEnvironment = (state: ComposerState) =>
  state.environment.find(it => it.name === DEFAULT_ENVIRONMENT_NAME)

export const selectShowDefaultEnvironment = (state: ComposerState) =>
  state.showDefaultDotEnv && state.bottomSection !== 'environment' && state.upperSection === 'compose'

// hook
const useComposerState = () => useRepatch(initialState)

export default useComposerState
