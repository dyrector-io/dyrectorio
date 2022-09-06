import { Dispatch, SetStateAction, useEffect, useState } from 'react'

export const pageSizes = [5, 10, 20, 50, 100, 250] as const

export type PageDataType = {
  pageSize: typeof pageSizes[number]
  currentPage: number
}

export type UsePaginationOptions<Item> = {
  initialPagination?: PageDataType
  initialData?: Item[]
}

export type PaginationConfig<Item> = {
  items: Item[]
  displayed: Item[]
  pageData: PageDataType
  setItems: Dispatch<SetStateAction<Item[]>>
  setPageData: (pagination: Partial<PageDataType>) => void
}

export const usePagination = <Item>(options: UsePaginationOptions<Item>): PaginationConfig<Item> => {
  const [items, setItems] = useState<Item[]>(options.initialData)
  const [pageData, setPageData] = useState<PageDataType>(options.initialPagination)
  const [displayed, setDisplayed] = useState<Item[]>(items)

  useEffect(() => {
    const start = pageData.currentPage * pageData.pageSize
    const newData = items.slice(start, start + pageData.pageSize)

    setDisplayed(newData)
  }, [items, pageData])

  return {
    items,
    displayed,
    pageData,
    setItems,
    setPageData: it =>
      setPageData({
        ...pageData,
        ...it,
      }),
  }
}
