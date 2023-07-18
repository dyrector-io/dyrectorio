import { isServerSide } from '@app/utils'
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'

type UseLocalStorageOptions = {
  overwrite?: boolean
}

const useLocalStorage = <T = object | object[]>(
  key: string,
  initialValue: T,
  options?: UseLocalStorageOptions,
): [T, Dispatch<SetStateAction<T>>] => {
  const keyRef = useRef(key)

  const [value, setValue] = useState(() => {
    if (options?.overwrite) {
      return initialValue
    }

    const storedValue = !isServerSide() ? localStorage.getItem(key) : null
    if (storedValue) {
      initialValue = JSON.parse(storedValue)
    }

    return initialValue
  })

  useEffect(() => {
    if (value === null || value === undefined) {
      localStorage.removeItem(keyRef.current)
    }

    localStorage.setItem(keyRef.current, JSON.stringify(value))
  }, [value])

  return [value, setValue]
}

export default useLocalStorage
