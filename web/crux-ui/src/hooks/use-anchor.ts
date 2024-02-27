import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const anchorOfPath = (path: string): string | null => {
  const parts = path.split('#')
  if (parts.length < 2) {
    return null
  }

  return `#${parts.findLast(Boolean)}`
}

const useAnchor = (): string | null => {
  const router = useRouter()
  const path = router.asPath

  const [anchor, setAnchor] = useState(null)

  useEffect(() => {
    const newAnchor = anchorOfPath(path)

    setAnchor(newAnchor)
  }, [path])

  return anchor
}

export default useAnchor
