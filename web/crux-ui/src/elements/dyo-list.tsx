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

  const data: Array<string[]> | Array<React.ReactNode> = !props
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
    <div key={props.key} className={clsx('flex flex-row', props.className)}>
      {headers.map((header, index) => (
        <div key={`${props.key}-col-${index}`} className="flex flex-col flex-grow">
          {!showHeaders ? null : (
            <div
              key={`${props.key}-header-${index}`}
              className={headerClassNames[index] ?? 'text-bright font-bold h-8 mb-4 ml-2 mr-auto'}
            >
              {header}
            </div>
          )}

          {data.map((it, rowIndex) => (
            <div
              key={`${props.key}-${index}-${rowIndex}`}
              className={clsx(
                !props.noSeparator ? 'border-t-2 border-light-grey' : null,
                itemClassNames[index] ?? 'flex flex-grow min-h-12 text-light-eased z-1 p-2 my-auto',
              )}
            >
              {it[index]}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
