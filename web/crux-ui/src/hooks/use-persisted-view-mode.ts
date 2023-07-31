import { ViewMode } from '@app/components/shared/view-mode-toggle'
import { useEffect, useState } from 'react'

function usePersistedViewMode({
  initialViewMode,
  pageName,
}: {
  initialViewMode: ViewMode
  pageName: string
}): [ViewMode, (mode: ViewMode) => void] {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      const storedViewMode = localStorage.getItem(`viewMode_${pageName}`) as ViewMode
      return storedViewMode || initialViewMode
    }
    return initialViewMode
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`viewMode_${pageName}`, viewMode)
    }
  }, [viewMode, pageName])

  return [viewMode, setViewMode]
}

export default usePersistedViewMode
