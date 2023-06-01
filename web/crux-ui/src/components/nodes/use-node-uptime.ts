import { SECOND_IN_MILLIS } from '@app/const'
import useInterval from '@app/hooks/use-interval'
import { DyoNode } from '@app/models'
import { useState } from 'react'

const useNodeUptime = (node: DyoNode): number | null => {
  const [runningSince, setRunningSince] = useState<number>(null)

  const updateRunningSince = () => {
    if (node.status !== 'connected' || !node.connectedAt) {
      setRunningSince(null)
      return
    }

    const now = Date.now()
    const seconds = (now - new Date(node.connectedAt).getTime()) / 1000
    setRunningSince(Math.ceil(seconds))
  }

  useInterval(updateRunningSince, SECOND_IN_MILLIS)

  return runningSince
}

export default useNodeUptime
