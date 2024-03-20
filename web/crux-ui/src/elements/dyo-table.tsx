import Paginator, { PaginationSettings } from '@app/components/shared/paginator'
import clsx from 'clsx'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import DyoCheckbox from './dyo-checkbox'

const defaultPagination: PaginationSettings = { pageNumber: 0, pageSize: 10 }

type SortDirection = 'asc' | 'desc'
type SortFunction = (a: any, b: any, objectA: any, objectB: any) => number

type SortState = {
  column: number
  direction: SortDirection
}

export const sortString = (a: string, b: string) => (a ?? '').localeCompare(b)

export const sortNumber = (a: number, b: number) => b - a

export const sortDate = (a: string, b: string): number => {
  if (a && b) {
    return sortNumber(new Date(b).getTime(), new Date(a).getTime())
  }
  if (a) {
    return 1
  }
  if (b) {
    return -1
  }
  return 0
}

export const sortEnum =
  (values: readonly any[]) =>
  (a: string, b: string): number =>
    sortNumber(values.indexOf(a), values.indexOf(b))

export interface DyoColumnProps {
  /** Defines the header text */
  header?: string | (() => React.ReactNode)

  /** Defines which field to use in the body */
  field?: string
  body?: (it: any, index: number) => React.ReactNode

  className?: string
  headerClassName?: string
  bodyClassName?: string

  /**
   * Set sortable to true if the column is sortable.
   * sortField defines which field to use when sorting, can be a string or a function.
   * If no sortField is defined field is used by default.
   * sort defines the function to use when sorting by the column.
   */
  sortable?: boolean
  sortField?: string | ((it: any) => any)
  sort?: SortFunction

  suppressHydrationWarning?: boolean
  preventClickThrough?: boolean

  children?: React.ReactNode
}

export const DyoColumn = (_: DyoColumnProps) => null

export interface DyoCheckboxColumnProps {
  allSelected: boolean
  selected: string[]
  onAllChange: (it: boolean) => void
  onChange: (id: string, check: boolean) => void
  qaLabel: string
}

export const dyoCheckboxColumn = (props: DyoCheckboxColumnProps & DyoColumnProps) => {
  const { allSelected, selected, onAllChange, onChange, qaLabel, ...rest } = props

  return (
    <DyoColumn
      className="w-12"
      header={() => (
        <DyoCheckbox {...rest} checked={allSelected} onCheckedChange={onAllChange} qaLabel={`${qaLabel}-all`} />
      )}
      body={(it: any, index: number) => (
        <DyoCheckbox
          {...rest}
          checked={selected.includes(it.id)}
          onCheckedChange={check => onChange(it.id, check)}
          qaLabel={`${qaLabel}-${index}`}
        />
      )}
    />
  )
}

export interface DyoTableProps<T> {
  data: T[]
  dataKey?: keyof T
  className?: string
  headless?: boolean

  initialSortColumn?: number
  initialSortDirection?: SortDirection

  pagination?: 'server' | 'client'
  paginationTotal?: number

  onRowClick?: (it: T) => void

  /** Called in server pagination mode to fetch new data. */
  onServerPagination?: (it: PaginationSettings) => void
}

const DyoTable = <T,>(props: React.PropsWithChildren<DyoTableProps<T>>) => {
  const {
    data: propData,
    dataKey,
    className,
    initialSortColumn,
    initialSortDirection,
    pagination: propPagination,
    paginationTotal,
    headless,
    children,
    onRowClick,
    onServerPagination,
  } = props
  const columns = Array.isArray(children)
    ? (children as React.ReactElement<DyoColumnProps>[])?.map(it => it.props)
    : [(children as React.ReactElement<DyoColumnProps>).props]

  if (process.env.NODE_ENV === 'development') {
    columns.forEach((it, index) => {
      // eslint-disable-next-line no-console
      console.assert(
        !(!!it.body && !!it.field),
        `A column can only have either the field or the body defined, index: ${index}`,
      )
    })
  }

  const [pagination, setPagination] = useState<PaginationSettings>({ pageNumber: 0, pageSize: 10 })
  const [data, setData] = useState(propData)
  const [sort, setSort] = useState<SortState>(() => {
    const direction = initialSortDirection ?? 'asc'
    const sortColum = initialSortColumn != null ? initialSortColumn : columns.findIndex(it => it.sortable)

    return sortColum > -1
      ? {
          column: sortColum,
          direction,
        }
      : null
  })

  const getField = (obj: any, field: string | ((it: any) => any)) => {
    if (typeof field === 'function') {
      return field(obj)
    }

    const keys = field.split('.')
    return keys.reduce((it, key) => (it && it[key] !== undefined ? it[key] : undefined), obj)
  }

  const sortData = (items: T[], sortBy: SortState): T[] => {
    if (!sortBy) {
      return items
    }

    const direction = sortBy.direction === 'desc' ? -1 : 1

    const { field, sortField, sort: sortFunc } = columns[sortBy.column]
    const dataField = sortField ?? field

    return [...items].sort((a, b) => {
      const order = sortFunc(getField(a, dataField), getField(b, dataField), a, b)
      return order * direction
    })
  }

  const toggleSorting = (column: number) => {
    if (!columns[column].sortable) {
      return
    }

    if (!sort || sort.column !== column) {
      setSort({
        column,
        direction: 'asc',
      })
      return
    }

    setSort({
      column,
      direction: sort.direction === 'asc' ? 'desc' : 'asc',
    })
  }

  const paginate = (it: PaginationSettings) => {
    setPagination(it)

    if (propPagination === 'server') {
      onServerPagination(it)
    }
  }

  useEffect(() => {
    const sorted = sort ? sortData(propData, sort) : propData

    if (propPagination === 'client' && pagination.pageNumber * pagination.pageSize >= propData.length) {
      setPagination({
        ...pagination,
        pageNumber: Math.max(0, Math.floor(propData.length / pagination.pageSize) - 1),
      })
    }

    setData(sorted)
  }, [propData, sort])

  const pageItems =
    propPagination === 'client'
      ? data.slice(
          pagination.pageNumber * pagination.pageSize,
          pagination.pageNumber * pagination.pageSize + pagination.pageSize,
        )
      : data

  return (
    <table className={clsx('table-fixed', className ?? 'w-full')}>
      {headless ? null : (
        <thead>
          <tr>
            {columns.map((it, index) => {
              const roundPaddingClass =
                columns.length === 1
                  ? 'rounded-t-lg px-6'
                  : index === 0
                  ? 'rounded-tl-lg pl-6'
                  : index === columns.length - 1
                  ? 'rounded-tr-lg pr-6'
                  : null
              const cursorClass = it.sortable ? 'cursor-pointer' : null

              return (
                <th
                  key={index}
                  className={clsx(
                    'text-left align-middle uppercase text-bright text-sm font-semibold bg-medium-eased px-2 py-3 h-11',
                    roundPaddingClass,
                    cursorClass,
                    it.className,
                    it.headerClassName,
                  )}
                  suppressHydrationWarning={it.suppressHydrationWarning}
                  onClick={() => toggleSorting(index)}
                >
                  <div className="inline-flex">
                    {typeof it.header === 'function' ? it.header() : it.header}
                    {sort?.column === index && (
                      <Image
                        className="cursor-pointer ml-1 select-none"
                        src={sort.direction === 'asc' ? '/sort_asc.svg' : '/sort_desc.svg'}
                        alt="order"
                        width={16}
                        height={16}
                      />
                    )}
                  </div>
                </th>
              )
            })}
          </tr>
        </thead>
      )}
      <tbody>
        {pageItems.map((it, rowIndex) => {
          const click = onRowClick ? () => onRowClick(it) : null

          const key = dataKey ? getField(it, dataKey as string) : rowIndex

          return (
            <tr key={key} className={headless ? null : 'hover:bg-medium-muted'}>
              {columns.map((col, index) => {
                const cellData = col.field ? getField(it, col.field) : col.body ? col.body(it, index) : null
                const paddingClass = index === 0 ? 'pl-6' : index === columns.length - 1 ? 'pr-6' : null
                const cursorClass = click && !col.preventClickThrough ? 'cursor-pointer' : null

                return (
                  <td
                    key={index}
                    className={clsx(
                      'align-middle h-12 min-h-min text-light-eased p-2',
                      paddingClass,
                      cursorClass,
                      col.className,
                      col.bodyClassName,
                    )}
                    suppressHydrationWarning={col.suppressHydrationWarning}
                    onClick={click && !col.preventClickThrough ? click : null}
                  >
                    {cellData}
                  </td>
                )
              })}
            </tr>
          )
        })}
      </tbody>
      {propPagination && (
        <tfoot>
          <tr>
            <td colSpan={columns.length}>
              <Paginator
                onChanged={paginate}
                length={paginationTotal ?? propData.length}
                defaultPagination={defaultPagination}
              />
            </td>
          </tr>
        </tfoot>
      )}
    </table>
  )
}

export default DyoTable
