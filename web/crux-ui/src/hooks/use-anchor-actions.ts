import { AsyncVoidFunction } from '@app/utils'
import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'

export const ANCHOR_ACTION_PREFIX = '#action-'

export type AnchorActions = { [anchor: string]: VoidFunction | AsyncVoidFunction }

const useAnchorActions = (actions: AnchorActions) => {
  const triggered = useRef('')

  const router = useRouter()
  const [path, anchor] = router.asPath.split(ANCHOR_ACTION_PREFIX)

  useEffect(() => {
    if (triggered.current === anchor) {
      return
    }

    if (!anchor) {
      triggered.current = ''
      return
    }

    const action = actions[anchor]
    if (!action) {
      return
    }

    triggered.current = anchor

    const result = action()
    if (typeof result === 'object') {
      // promise
      result.finally(() => router.replace(path))
    } else {
      router.replace(path)
    }
  }, [anchor, path, actions, router])

  return actions
}

export default useAnchorActions
