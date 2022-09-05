import assert from 'assert'
import clsx from 'clsx'
import React from 'react'

export type DyoListItemBuilder<T> = (it: T, index: number) => React.ReactNode[]

export type DyoListProps<T> = {
  key?: React.Key
  className?: string
  headerClassName?: string | string[]
  itemClassName?: string | string[]
  footerClassName?: string | string[]
  columnWidths?: string[]
  headers?: string[]
  footer?: React.ReactNode
  data: T[]
  noSeparator?: boolean
  itemBuilder?: DyoListItemBuilder<T>
}

export const DyoList = <T,>(props: DyoListProps<T>) => {
  const isArrayOfStringArrays = it =>
    Array.isArray(it) &&
    (it.length === 0 || (it.length > 0 && Array.isArray(it[0]) && it[0].length > 0 && typeof it[0][0] === 'string'))

  assert(
    props.itemBuilder || isArrayOfStringArrays(props.data),
    'If the data type is not string, then you must define the itemBuilder',
  )

  const data: Array<string[]> | Array<React.ReactNode[]> = !props
    ? []
    : isArrayOfStringArrays(props.data)
    ? (props.data as any as string[][])
    : props.data.map((it, index) => props.itemBuilder(it, index))

  const headerClassNames: string[] = props.headers
    ? typeof props.headerClassName === 'string'
      ? props.headers.map(() => props.headerClassName as string)
      : props.headerClassName ?? props.headers.map(() => null)
    : []

  const itemClassNames: string[] = data[0]
    ? typeof props.itemClassName === 'string'
      ? data[0].map(() => props.itemClassName as string)
      : props.itemClassName ?? data[0].map(() => null)
    : []

  return (
    <>
      <div
        key={props.key}
        className={clsx('table w-full rounded-lg overflow-auto', props.className, props.columnWidths && 'table-fixed')}
      >
        {props.headers ? (
          <div className="table-header-group">
            <div className="table-row">
              {props.headers.map((header, index) => (
                <div
                  key={`${props.key}-header-${index}`}
                  className={clsx(
                    'table-cell text-left align-middle',
                    headerClassNames[index] ?? 'text-bright font-bold h-8 mb-4 ml-2 mr-auto',
                    props.columnWidths ? props.columnWidths[index] ?? '' : '',
                  )}
                >
                  {header}
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <div className="table-row-group">
          {data.map((row, rowIndex) => (
            <div className="table-row" key={`${props.key}-${rowIndex}`}>
              {row.map((_, colIndex) => (
                <div
                  key={`${props.key}-${colIndex}-${rowIndex}`}
                  className={clsx(
                    'table-cell align-middle',
                    !props.noSeparator ? 'border-t-2 border-light-grey' : null,
                    itemClassNames[colIndex] ?? 'h-12 min-h-min text-light-eased p-2',
                  )}
                >
                  {row[colIndex]}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div>{props.footer}</div>
    </>
  )
}
