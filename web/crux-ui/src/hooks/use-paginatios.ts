import { Dispatch, SetStateAction, useEffect, useState } from 'react'

export type UsePaginationOptions<Item> = {
  initialPagination?: Pagination
} & ({ initialData?: Item[]; data?: never } | { initialData?: never; data?: Item[] })

export type PaginationConfig<Item, Pagination> = {
  items: Item[]
  displayed: Item[]
  setItems: Dispatch<SetStateAction<Item[]>>
  setPagination: (pagination: Partial<Pagination>) => void
}

export type Pagination = {
  pageSize: number
  currentPage: number
}

export const usePagination = <Item>(
  options: UsePaginationOptions<Item>,
): PaginationConfig<Item, Pagination> => {
  const [items, setItems] = useState<Item[]>(options.data ?? options.initialData)
  const [pagination, setPagination] = useState<Pagination>(options.initialPagination)
  const [displayed, setDisplayed] = useState<Item[]>(items)
  // const []

  useEffect(() => {
    let start = pagination.currentPage * pagination.pageSize
    let newData = items.slice(start, start + pagination.pageSize)

    setDisplayed(newData)
  }, [items, pagination])

  return {
    items,
    displayed,
    setItems: !options.data ? setItems : setItemsError,
    setPagination: it =>
      setPagination({
        ...pagination,
        ...it,
      }),
  }
}

const setItemsError = () => {
  throw new Error('This is a Pagination Error')
}
