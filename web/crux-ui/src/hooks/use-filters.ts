import { Dispatch, SetStateAction, useEffect, useState } from 'react'

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
  const [items, setItems] = options.data ? [options.data, () => {}] : useState(options.initialData)
  const [filter, setFilter] = useState<Filter>(options.initialFilter)
  const [filtered, setFiltered] = useState(items)

  useEffect(() => {
    let newData = [...items]
    options.filters.forEach(it => {
      newData = it(newData, filter)
    })

    setFiltered(newData)
  }, [items, filter])

  return {
    items,
    filtered,
    filter,
    setItems,
    setFilter: it =>
      setFilter({
        ...filter,
        ...it,
      }),
  }
}

export type TextFilter = {
  text: string
}

export type PropertyValuesOf<Item> = (item: Item) => string[]

export const textFilterFor =
  <Item>(propertiesOf: PropertyValuesOf<Item>): FilterFunction<Item, TextFilter> =>
  (items: Item[], filter: TextFilter) => {
    const text = filter?.text?.trim().toLowerCase()
    if (text && text.length < 1) {
      return items
    }

    return items.filter(it => {
      const properties = propertiesOf(it)
      return properties.filter(it => !!it && it.toLowerCase().includes(text)).length > 0
    })
  }
