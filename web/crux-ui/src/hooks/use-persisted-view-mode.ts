import { ViewMode } from '@app/components/shared/view-mode-toggle'
import { useEffect, useState } from 'react'

type PersistedViewMode = {
  projects?: ViewMode
  versions?: ViewMode
  deployments?: ViewMode
}

type PersistedViewModeKey = keyof PersistedViewMode

type PersistedViewModeOptions = {
  initialViewMode: ViewMode
  pageName: PersistedViewModeKey
}

const PERSISTED_VIEW_MODE = 'persisted-view-mode'

const usePersistedViewMode = (options: PersistedViewModeOptions): [ViewMode, (mode: ViewMode) => void] => {
  const { initialViewMode, pageName } = options

  const [viewMode, setViewMode] = useState<PersistedViewMode>(() => {
    const initialPersistedViewMode: PersistedViewMode = {}
    initialPersistedViewMode[pageName] = initialViewMode
    return initialPersistedViewMode
  })

  useEffect(() => {
    const storedViewMode = JSON.parse(localStorage.getItem(PERSISTED_VIEW_MODE)) as PersistedViewMode
    if (storedViewMode) {
      setViewMode(storedViewMode)
    }
  }, [pageName])

  const updateViewMode = (mode: ViewMode) => {
    const newViewMode = {
      ...viewMode,
    }
    newViewMode[pageName] = mode

    setViewMode(newViewMode)
    localStorage.setItem(PERSISTED_VIEW_MODE, JSON.stringify(newViewMode))
  }

  return [viewMode[pageName] ?? initialViewMode, updateViewMode]
}

export default usePersistedViewMode
