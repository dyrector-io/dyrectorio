import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'

const setItemsError = () => {
  throw new Error('Can not set filter items, when data was explicitly provided.')
}

export type FilterFunction<Item, Filter> = (items: Item[], filter: Filter) => Item[]

export type UseFiltersOptions<Item, Filter> = {
  filters: FilterFunction<Item, Filter>[]
  initialFilter?: Filter
} & ({ initialData?: Item[]; data?: never } | { initialData?: never; data?: Item[] })

export type FilterConfig<Item, Filter> = {
  items: Item[]
  filtered: Item[]
  filter: Filter
  setItems: Dispatch<SetStateAction<Item[]>>
  setFilter: (filter: Partial<Filter>) => void
}

export const useFilters = <Item, Filter>(options: UseFiltersOptions<Item, Filter>): FilterConfig<Item, Filter> => {
  const filters = useRef(options.filters)

  const [items, setItems] = useState(options.data ?? options.initialData)
  const [filter, setFilter] = useState<Filter>(options.initialFilter)
  const [filtered, setFiltered] = useState(items)

  useEffect(() => {
    let newData = [...items]
    filters.current.forEach(it => {
      newData = it(newData, filter)
    })

    setFiltered(newData)
  }, [items, filter, filters])

  return {
    items,
    filtered,
    filter,
    setItems: !options.data ? setItems : setItemsError,
    setFilter: it =>
      setFilter({
        ...filter,
        ...it,
      }),
  }
}

export type PropertyValuesOf<Item> = (item: Item) => string[]

export type TextFilter = {
  text?: string
}

export const textFilterFor =
  <Item>(propertiesOf: PropertyValuesOf<Item>): FilterFunction<Item, TextFilter> =>
  (items: Item[], filter: TextFilter) => {
    const text = filter?.text?.trim().toLowerCase()
    if (!text || text.length < 1) {
      return items
    }

    return items.filter(it => {
      const properties = propertiesOf(it)
      return properties.filter(pit => !!pit && pit.toLowerCase().includes(text)).length > 0
    })
  }

export type DateRangeFilter = {
  dateRange: [Date, Date]
}

export const dateRangeFilterFor =
  <Item>(propertiesOf: PropertyValuesOf<Item>): FilterFunction<Item, DateRangeFilter> =>
  (items: Item[], filter: DateRangeFilter) => {
    if (filter.dateRange[0] === null && filter.dateRange[1] === null) {
      return items
    }

    return items.filter(it => {
      const properties = propertiesOf(it)
      return (
        properties.filter(
          i =>
            (filter.dateRange[0] === null || new Date(i) >= filter.dateRange[0]) &&
            (filter.dateRange[1] === null || new Date(i) <= filter.dateRange[1]),
        ).length > 0
      )
    })
  }

export type EnumFilter<TEnum> = {
  enum?: TEnum
}

export const enumFilterFor =
  <Item, Enum>(propertiesOf: PropertyValuesOf<Item>): FilterFunction<Item, EnumFilter<Enum>> =>
  (items: Item[], filter: EnumFilter<Enum>) => {
    if (filter?.enum === undefined || filter?.enum === null) {
      return items
    }

    return items.filter(it => {
      const properties = propertiesOf(it)
      return properties.filter(i => i === filter.enum.toString()).length > 0
    })
  }
