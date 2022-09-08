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
  const {
    key,
    className,
    headerClassName,
    itemClassName,
    footerClassName,
    columnWidths,
    headers,
    footer,
    data: propsData,
    noSeparator,
    itemBuilder,
  } = props

  const isArrayOfStringArrays = it =>
    Array.isArray(it) &&
    (it.length === 0 || (it.length > 0 && Array.isArray(it[0]) && it[0].length > 0 && typeof it[0][0] === 'string'))

  assert(
    itemBuilder || isArrayOfStringArrays(propsData),
    'If the data type is not string, then you must define the itemBuilder',
  )

  const data: Array<string[]> | Array<React.ReactNode[]> = !props
    ? []
    : isArrayOfStringArrays(propsData)
    ? (propsData as any as string[][])
    : propsData.map((it, index) => itemBuilder(it, index))

  const headerClassNames: string[] = headers
    ? typeof headerClassName === 'string'
      ? headers.map(() => headerClassName as string)
      : headerClassName ?? headers.map(() => null)
    : []

  const itemClassNames: string[] = data[0]
    ? typeof itemClassName === 'string'
      ? data[0].map(() => itemClassName as string)
      : itemClassName ?? data[0].map(() => null)
    : []

  return (
    <>
      <div
        key={key}
        className={clsx('table w-full rounded-lg overflow-auto', className, columnWidths && 'table-fixed')}
      >
        {headers ? (
          <div className="table-header-group">
            <div className="table-row">
              {headers.map((header, index) => (
                <div
                  key={`${key}-header-${index}`}
                  className={clsx(
                    'table-cell text-left align-middle',
                    headerClassNames[index] ?? 'text-bright font-bold h-8 mb-4 ml-2 mr-auto',
                    columnWidths ? columnWidths[index] ?? '' : '',
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
            <div className="table-row" key={`${key}-${rowIndex}`}>
              {row.map((_, colIndex) => (
                <div
                  key={`${key}-${colIndex}-${rowIndex}`}
                  className={clsx(
                    'table-cell align-middle',
                    !noSeparator ? 'border-t-2 border-light-grey' : null,
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
      <div className={clsx(footerClassName)}>{footer}</div>
    </>
  )
}
