import { useRouter } from 'next/router'

const anchorOfPath = (path: string): string | null => {
  const parts = path.split('#')

  if (parts.length < 2) {
    return null
  }

  return `#${parts.findLast(Boolean)}`
}

const useAnchor = (): string | null => {
  const router = useRouter()
  const anchor = anchorOfPath(router.asPath)

  return anchor
}

export default useAnchor
