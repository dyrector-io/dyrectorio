import assert from 'assert'
import clsx from 'clsx'
import React from 'react'
import { DyoCard } from './dyo-card'

export type DyoListItemBuilder<T> = (it: T) => React.ReactElement[]

export type DyoListProps<T> = {
  className?: string
  headerClassName?: string
  itemClassName?: string
  headers: string[]
  data: T[]
  itemBuilder?: DyoListItemBuilder<T>
}

export function DyoList<T>(props: DyoListProps<T>) {
  const isArrayOfStringArrays = it =>
    Array.isArray(it) &&
    (it.length === 0 ||
      (it.length > 0 &&
        Array.isArray(it[0]) &&
        it[0].length > 0 &&
        typeof it[0][0] === 'string'))

  assert(
    props.itemBuilder || isArrayOfStringArrays(props.data),
    'If the data type is not string, then you must define the itemBuilder',
  )

  const headerClass = props.headerClassName ?? 'text-center font-bold mb-4 mx-2'

  const data: Array<string[]> | Array<React.ReactElement[]> = !props
    ? []
    : isArrayOfStringArrays(props.data)
    ? (props.data as any as string[][])
    : props.data.map(it => props.itemBuilder(it))

  // this is necessary for production, because tailwind's purge wouldn't recognize dynamically contcatenated class names
  const colClassNames = [
    'grid-cols-fr-auto-1',
    'grid-cols-fr-auto-2',
    'grid-cols-fr-auto-3',
    'grid-cols-fr-auto-4',
    'grid-cols-fr-auto-5',
    'grid-cols-fr-auto-6',
    'grid-cols-fr-auto-7',
    'grid-cols-fr-auto-8',
    'grid-cols-fr-auto-9',
    'grid-cols-fr-auto-10',
    'grid-cols-fr-auto-11',
    'grid-cols-fr-auto-12',
  ]
  const colClassName = colClassNames[props.headers.length - 1]

  return (
    <DyoCard
      className={clsx('grid auto-rows-min', colClassName, props.className)}
    >
      {props.headers.map((it, index) => (
        <div key={`header-${index}`} className={headerClass}>
          {it}
        </div>
      ))}

      {data.map((_, index) => (
        <DyoListItem
          key={`item-${index}`}
          index={index}
          itemClassName={props.itemClassName}
          data={data[index]}
          alternate={index % 2 === 0}
        />
      ))}
    </DyoCard>
  )
}

type DyoListItemProps = {
  index: number
  itemClassName?: string
  data: string[] | React.ReactElement[]
  alternate?: boolean
}

function DyoListItem(props: DyoListItemProps) {
  const color = props.alternate ? 'bg-dyo-light-purple' : 'bg-transparent'
  const itemClass = clsx(
    color,
    props.itemClassName ?? 'flex justify-center content-center p-2',
  )

  const classes =
    props.data.length === 1
      ? [clsx(itemClass, 'rounded-3xl')]
      : props.data.length === 2
      ? [clsx(itemClass, 'rounded-l-3xl'), clsx(itemClass, 'rounded-r-3xl')]
      : [
          clsx(itemClass, 'rounded-l-3xl'),
          ...Array.from({ length: props.data.length - 2 }, () => itemClass),
          clsx(itemClass, 'rounded-r-3xl'),
        ]

  return (
    <>
      {props.data.map((it, index) => (
        <div key={`${props.index}-${index}`} className={classes[index]}>
          {it}
        </div>
      ))}
    </>
  )
}
