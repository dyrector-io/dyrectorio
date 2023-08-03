import { ViewMode } from '@app/components/shared/view-mode-toggle'
import { useEffect, useState } from 'react'

function usePersistedViewMode({
  initialViewMode,
  pageName,
}: {
  initialViewMode: ViewMode
  pageName: string
}): [ViewMode, (mode: ViewMode) => void] {
  const [viewMode, setViewMode] = useState<ViewMode>(() => initialViewMode)

  useEffect(() => {
    const storedViewMode = localStorage.getItem(`viewMode_${pageName}`) as ViewMode
    if (storedViewMode) {
      setViewMode(storedViewMode)
    }
  }, [pageName])

  const updateViewMode = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem(`viewMode_${pageName}`, mode)
  }

  return [viewMode, updateViewMode]
}

export default usePersistedViewMode
