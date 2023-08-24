import { Audit } from '@app/models'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export type SortDirection = 'asc' | 'desc'

export type SortFunction = (a: any, b: any) => number
export type SortFunctions = { [key: string]: SortFunction }

export type FieldGetters<Item> = { [key: string]: (item: Item) => any }

export interface SortOptions<Item, Fields extends string> {
  sortFunctions: SortFunctions
  fieldGetters?: FieldGetters<Item>
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
  functions: SortFunctions,
  fieldGetters?: FieldGetters<Item>,
): Item[] => {
  if (!sortBy || !sortBy.field || !sortBy.direction) {
    return items
  }

  const sortFunction = functions[sortBy.field]
  const direction = sortBy.direction === 'desc' ? -1 : 1

  return [...items].sort((a, b) => {
    const getter = fieldGetters?.[sortBy.field] ?? ((item: Item) => item[sortBy.field as string])
    const order = sortFunction(getter(a), getter(b))
    return order * direction
  })
}

export const useSorting = <Item, Fields extends string>(
  data: Item[],
  options: SortOptions<Item, Fields>,
): SortConfig<Item, Fields> => {
  const { sortFunctions, fieldGetters, initialField, initialDirection } = options

  const [sortBy, setSortBy] = useState<SortState<Fields>>(
    initialField && initialDirection
      ? {
          field: initialField,
          direction: initialDirection,
        }
      : null,
  )
  const [items, setItems] = useState<Item[]>(data ? sortData(data, sortBy, sortFunctions, fieldGetters) : [])

  useEffect(() => {
    setItems(sortData(data, sortBy, sortFunctions, fieldGetters))
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

export const auditFieldGetter = <Item extends { audit: Audit }>(value: Item) =>
  value.audit.updatedAt ?? value.audit.createdAt

export const stringSort = (a: string | null, b: string | null): number => (a ?? '').localeCompare(b)

export const dateSort = (a: string | null, b: string | null): number => {
  if (a && b) {
    return new Date(b).getTime() - new Date(a).getTime()
  }
  if (a) {
    return 1
  }
  if (b) {
    return -1
  }
  return 0
}

export const enumSort =
  (values: readonly any[]) =>
  (a: string, b: string): number =>
    values.indexOf(a) - values.indexOf(b)

export const numberSort = (a: number | null, b: number | null) => {
  if (a && b) {
    return Math.sign(b - a)
  }
  if (a) {
    return 1
  }
  if (b) {
    return -1
  }
  return 0
}
