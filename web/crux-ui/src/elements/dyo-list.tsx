import assert from 'assert'
import clsx from 'clsx'
import React from 'react'

export type DyoListItemBuilder<T> = (it: T, index: number) => React.ReactNode[]

export type DyoListProps<T> = {
  key?: React.Key
  className?: string
  headerClassName?: string | string[]
  itemClassName?: string | string[]
  headers: string[] | number
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

  const showHeaders = typeof props.headers !== 'number'
  const headers: string[] = showHeaders ? (props.headers as string[]) : Array.from({ length: props.headers as number })

  const headerClassNames: string[] =
    typeof props.headerClassName === 'string'
      ? (headers.map(() => props.headerClassName as string) as string[])
      : props.headerClassName ?? headers.map(() => null)

  const itemClassNames: string[] =
    typeof props.itemClassName === 'string'
      ? (headers.map(() => props.itemClassName as string) as string[])
      : props.itemClassName ?? headers.map(() => null)

  return (
    <div key={props.key} className={clsx('table w-full', props.className)}>
      <div className="table-header-group">
        <div className="table-row">
          {headers.map((header, index) => (
            <div key={`${props.key}-col-${index}`} className="table-cell text-left align-middle">
              {!showHeaders ? null : (
                <div
                  key={`${props.key}-header-${index}`}
                  className={headerClassNames[index] ?? 'text-bright font-bold h-8 mb-4 ml-2 mr-auto'}
                >
                  {header}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="table-row-group">
        {data.map((line, rowIndex) => (
          <div className="table-row" key={`${props.key}-${rowIndex}`}>
            {line.map((_, column) => (
              <div
                key={`${props.key}-${column}-${rowIndex}`}
                className={clsx(
                  'table-cell align-middle',
                  !props.noSeparator ? 'border-t-2 border-light-grey' : null,
                  itemClassNames[column] ?? 'h-12 min-h-min text-light-eased p-2',
                )}
              >
                {line[column]}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
