import useRepatch, { RepatchAction } from '@app/hooks/use-repatch'
import { PipelineDetails, PipelineEventWatcher, PipelineRun, PipelineStatusMessage } from '@app/models'
import { Dispatch } from 'react'

// state
export type PipelineDetailsViewState = 'run-list' | 'event-watchers' | 'editing' | 'trigger' | 'edit-event-watcher'

export type PipelineDetailsState = {
  viewState: PipelineDetailsViewState
  pipeline: PipelineDetails
  runs: PipelineRun[]
  editedEventWatcher: PipelineEventWatcher | null
}

export type PipelineDetailsDispatch = Dispatch<RepatchAction<PipelineDetailsState>>

// actions
export const setRuns =
  (runs: PipelineRun[]): RepatchAction<PipelineDetailsState> =>
  state => ({
    ...state,
    runs,
  })

export const updateRunState =
  (message: PipelineStatusMessage): RepatchAction<PipelineDetailsState> =>
  state => {
    if (message.pipelineId !== state.pipeline.id) {
      return state
    }

    let runList = state.runs
    let run = runList.find(it => it.id === message.runId)
    if (!run) {
      run = {
        id: message.runId,
        startedBy: null,
        startedAt: new Date().toUTCString(),
        finishedAt: message.finishedAt,
        status: message.status,
      }

      runList = [run, ...state.runs]
    } else {
      run.finishedAt = message.finishedAt
      run.status = message.status
    }

    return {
      ...state,
      runs: runList,
    }
  }

export const setViewState =
  (viewState: PipelineDetailsViewState): RepatchAction<PipelineDetailsState> =>
  state => {
    if (state.viewState === viewState) {
      return state
    }

    return {
      ...state,
      viewState,
      editedEventWatcher: null,
    }
  }

export const pipelineEdited =
  (pipeline: PipelineDetails): RepatchAction<PipelineDetailsState> =>
  state => ({
    ...state,
    pipeline,
    viewState: 'run-list',
    runs: state.runs,
  })

export const pipelineTriggered =
  (run: PipelineRun): RepatchAction<PipelineDetailsState> =>
  state => {
    let runList = [...state.runs]

    const index = runList.findIndex(it => it.id === run.id)
    if (index > -1) {
      // ws message update has arrived earlier

      const existingRun = runList[index]
      runList[index] = {
        ...run,
        status: existingRun.status,
        finishedAt: existingRun.finishedAt,
      }
    } else {
      runList = [run, ...runList]
    }

    return {
      ...state,
      viewState: 'run-list',
      runs: runList,
    }
  }

export const upsertEventWatcher =
  (eventWatcher: PipelineEventWatcher): RepatchAction<PipelineDetailsState> =>
  state => {
    const watchers = state.pipeline.eventWatchers
    const index = watchers.findIndex(it => it.id === eventWatcher.id)
    if (index > -1) {
      watchers[index] = eventWatcher
    } else {
      watchers.push(eventWatcher)
    }

    return {
      ...state,
      pipeline: {
        ...state.pipeline,
        eventWatchers: watchers,
      },
      editedEventWatcher: null,
      viewState: 'event-watchers',
    }
  }

export const editEventWatcher =
  (eventWatcher: PipelineEventWatcher | null): RepatchAction<PipelineDetailsState> =>
  state => ({
    ...state,
    viewState: 'edit-event-watcher',
    editedEventWatcher: eventWatcher,
  })

export const removeEventWatcher =
  (eventWatcher: PipelineEventWatcher): RepatchAction<PipelineDetailsState> =>
  state => ({
    ...state,
    pipeline: {
      ...state.pipeline,
      eventWatchers: state.pipeline.eventWatchers.filter(it => it.id !== eventWatcher.id),
    },
  })

// selectors
export const selectPipelineSectionState = (state: PipelineDetailsState): PipelineDetailsViewState | null => {
  switch (state.viewState) {
    case 'trigger':
    case 'run-list':
      return 'run-list'
    case 'edit-event-watcher':
    case 'event-watchers':
      return 'event-watchers'
    default:
      return null
  }
}

export const selectedEditedEventWatcher = (state: PipelineDetailsState): PipelineEventWatcher => {
  const inputs = [...state.pipeline.trigger.inputs]

  if (!state.editedEventWatcher) {
    return {
      id: null,
      name: '',
      event: 'image-push',
      registry: null,
      createdAt: null,
      triggerInputs: inputs,
      filters: {
        imageNameStartsWith: '',
      },
    }
  }

  const eventWatcher = state.editedEventWatcher

  eventWatcher.triggerInputs.forEach(watcherInput => {
    const index = inputs.findIndex(it => watcherInput.id === it.id)
    if (index > -1) {
      inputs[index] = watcherInput
    } else {
      inputs.push(watcherInput)
    }
  })

  return {
    ...eventWatcher,
    triggerInputs: inputs,
  }
}

// hook
const usePipelineDetailsState = (initialState: PipelineDetailsState): [PipelineDetailsState, PipelineDetailsDispatch] =>
  useRepatch(initialState)

export default usePipelineDetailsState
