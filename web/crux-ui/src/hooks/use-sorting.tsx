import Image from 'next/image'
import { useEffect, useState } from 'react'

export type SortDirection = 'asc' | 'desc'

export type SortFunction<Item> = (field: string, a: Item, b: Item) => number
export type SortFunctions<Item> = { [key: string]: SortFunction<Item> }

export interface SortOptions<Item, Fields extends string> {
  sortFunctions: SortFunctions<Item>
  initialField?: Fields
  initialDirection?: SortDirection
}

export interface SortConfig<Item, Fields extends string> {
  items: Item[]
  sortField: Fields
  sortDirection: SortDirection
  toggleSorting(field: Fields)
}

interface SortState<Fields extends string> {
  field: Fields
  direction: SortDirection
}

const sortData = <Item, Fields extends string>(
  items: Item[],
  sortBy: SortState<Fields>,
  functions: SortFunctions<Item>,
): Item[] => {
  if (!sortBy || !sortBy.field || !sortBy.direction) {
    return items
  }

  const sortFunction = functions[sortBy.field]
  const direction = sortBy.direction === 'desc' ? -1 : 1

  return [...items].sort((a, b) => {
    const order = sortFunction(sortBy.field, a, b)
    return order * direction
  })
}

export const useSorting = <Item, Fields extends string>(
  data: Item[],
  options: SortOptions<Item, Fields>,
): SortConfig<Item, Fields> => {
  const { sortFunctions, initialField, initialDirection } = options

  const [sortBy, setSortBy] = useState<SortState<Fields>>(
    initialField && initialDirection
      ? {
          field: initialField,
          direction: initialDirection,
        }
      : null,
  )
  const [items, setItems] = useState<Item[]>(data ? sortData(data, sortBy, sortFunctions) : [])

  useEffect(() => {
    setItems(sortData(data, sortBy, sortFunctions))
  }, [data, sortBy])

  const toggleSorting = (field: Fields) => {
    if (!sortBy || sortBy.field !== field) {
      setSortBy({
        field,
        direction: 'asc',
      })
      return
    }

    if (sortBy.direction === 'asc') {
      setSortBy({
        field,
        direction: 'desc',
      })
      return
    }

    setSortBy(null)
  }

  return {
    items,
    sortField: sortBy?.field || null,
    sortDirection: sortBy?.direction || null,
    toggleSorting,
  }
}

export type SortHeaderBuilderMapping<Fields extends string> = { [key: string]: Fields }

export const sortHeaderBuilder =
  <Item, Fields extends string>(
    sort: SortConfig<Item, Fields>,
    mapping: SortHeaderBuilderMapping<Fields>,
    translate: (string) => string,
  ) =>
  (header: string): React.ReactNode =>
    mapping[header] ? (
      sort.sortField === mapping[header] ? (
        <div
          className="inline-flex flex-row cursor-pointer select-none"
          onClick={() => sort.toggleSorting(mapping[header])}
        >
          <span>{translate(header)}</span>
          <Image
            className="cursor-pointer ml-1"
            src={sort.sortDirection === 'asc' ? '/arrow_up.svg' : '/arrow_down.svg'}
            alt="order"
            width={16}
            height={16}
          />
        </div>
      ) : (
        <span className="cursor-pointer select-none" onClick={() => sort.toggleSorting(mapping[header])}>
          {translate(header)}
        </span>
      )
    ) : (
      translate(header)
    )

export const stringSort = <Item,>(field: string, a: Item, b: Item): number => (a[field] ?? '').localeCompare(b[field])

export const dateSort = <Item,>(field: string, a: Item, b: Item): number => {
  if (a[field] && b[field]) {
    return new Date(b[field]).getTime() - new Date(a[field]).getTime()
  }
  if (a[field]) {
    return 1
  }
  if (b[field]) {
    return -1
  }
  return 0
}
