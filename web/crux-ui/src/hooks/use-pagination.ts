import { PaginationSettings } from '@app/components/shared/paginator'
import { PaginatedList, PaginationQuery } from '@app/models'
import { DependencyList, Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'

export type PaginationOptions<T> = {
  defaultSettings: PaginationSettings
  fetchData: (query: PaginationQuery) => Promise<PaginatedList<T>>
}

export type DispatchPagination = Dispatch<SetStateAction<PaginationSettings>>

export type RefreshPageFunc = () => void

export type Pagination<T> = {
  total: number
  settings: PaginationSettings
  data: T[]
}

const usePagination = <T>(
  options: PaginationOptions<T>,
  deps?: DependencyList,
): [Pagination<T>, DispatchPagination, RefreshPageFunc] => {
  const [total, setTotal] = useState(0)
  const [settings, setSettings] = useState<PaginationSettings>(options.defaultSettings)
  const [data, setData] = useState<T[]>(null)

  const fetchCall = options.fetchData
  const onFetchData = useCallback(async () => {
    const { pageSize, pageNumber } = settings

    const query: PaginationQuery = {
      skip: pageSize * pageNumber,
      take: pageSize,
    }

    const list = await fetchCall(query)
    if (!list) {
      setData(null)
      setTotal(0)
      return
    }

    setData(list.items)
    setTotal(list.total)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, ...(deps ?? [])])

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    onFetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings])

  return [
    {
      data,
      settings,
      total,
    },
    setSettings,
    onFetchData,
  ]
}

export default usePagination
