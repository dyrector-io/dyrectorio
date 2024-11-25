import useRepatch, { RepatchAction } from '@app/hooks/use-repatch'
import {
  ConcreteContainerConfig,
  ContainerConfig,
  ContainerConfigData,
  ContainerConfigKey,
  WebSocketSaveState,
} from '@app/models'
import { Dispatch } from 'react'

// state
export type ContainerConfigState = {
  config: ContainerConfig | ConcreteContainerConfig
  saveState: WebSocketSaveState
  parseError: string
}

export type ContainerConfigAction = RepatchAction<ContainerConfigState>
export type ContainerConfigDispatch = Dispatch<ContainerConfigAction>

// actions
export const setSaveState =
  (saveState: WebSocketSaveState): ContainerConfigAction =>
  state => ({
    ...state,
    saveState,
  })

export const setParseError =
  (error: string): ContainerConfigAction =>
  state => ({
    ...state,
    parseError: error,
  })

export const patchConfig =
  (config: ContainerConfigData): ContainerConfigAction =>
  state => ({
    ...state,
    saveState: 'saving',
    config: {
      ...state.config,
      ...config,
    },
  })

export const resetSection =
  (section: ContainerConfigKey): ContainerConfigAction =>
  state => {
    const newConfg: ContainerConfig = {
      ...state.config,
    }

    newConfg[section as string] = null
    return {
      ...state,
      saveState: 'saving',
      config: newConfg,
    }
  }

// selectors

// hook
const useContainerConfigState = (initialState: ContainerConfigState): [ContainerConfigState, ContainerConfigDispatch] =>
  useRepatch(initialState)

export default useContainerConfigState
