import assert from 'assert'
import clsx from 'clsx'
import React from 'react'

export type ItemBuilder<T> = (it: T, index: number) => React.ReactNode[]

export type ImageHorizontalListProps<T> = {
  key?: React.Key
  className?: string
  titleClassName?: string | string[]
  footerClassName?: string | string[]
  columnWidths?: string[]
  title?: string[]
  footer?: React.ReactNode
  data: T[]
  noSeparator?: boolean
  itemBuilder?: ItemBuilder<T>
  cellClick?: (data: T, rowIndex: number, columnIndex: number) => void
}

const columnNum = 5
const columnWidthClass = 'w-2/12'

export const ImageHorizontalList = <T,>(props: ImageHorizontalListProps<T>) => {
  const {
    key,
    className,
    titleClassName,
    footerClassName,
    columnWidths,
    title,
    footer,
    data: propsData,
    noSeparator,
    itemBuilder,
    cellClick,
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

  const rows = Math.ceil(data.length / columnNum)
  const getColIndex = (index: number) => index % columnNum
  const getRowIndex = (index: number) => Math.floor(index / columnNum)

  const rowData = (items: React.JSX.Element[], from: number, amt: number) => {
    const elements: React.JSX.Element[] = []
    for (let i = from; i < from + amt; i++) {
      elements.push(items[i])
    }

    return elements
  }

  const buildItems = () =>
    data.map((item, index) => {
      return (
        <div
          key={`${key}-${getColIndex(index)}-${getRowIndex(index)}`}
          className={clsx(
            'table-cell align-middle',
            !noSeparator && getRowIndex(index) < rows - 1 ? 'border-b-2 border-light-grey' : null,
            !noSeparator && getColIndex(index) < columnNum - 1 ? 'border-r-2 border-light-grey' : null,
            'h-12 min-h-min text-light-eased p-2 text-center',
            columnWidthClass,
          )}
          onClick={
            cellClick
              ? () => cellClick(propsData[getRowIndex(index)], getRowIndex(index), getColIndex(index))
              : undefined
          }
        >
          {item}
        </div>
      )
    })

  const tableContent = data => {
    const items: React.JSX.Element[] = buildItems()

    const rowContent: React.JSX.Element[] = []
    for (let i = 0; i < rows; i++) {
      rowContent.push(
        <div className="table-row" key={`${key}-${i}`}>
          {rowData(items, i * columnNum, columnNum)}
        </div>,
      )
    }

    return rowContent
  }

  return (
    <>
      {title && (
        <div className="w-full text-center">
          <div
            key={`${key}-header`}
            className={clsx('align-middle', titleClassName ?? 'text-bright font-bold h-8 mb-4 ml-2 mr-auto')}
          >
            {title}
          </div>
        </div>
      )}
      <div
        key={key}
        className={clsx('table w-full rounded-lg overflow-auto', className, columnWidths && 'table-fixed')}
      >
        <div className="table-row-group">{tableContent(data)}</div>
      </div>
      <div className={clsx(footerClassName)}>{footer}</div>
    </>
  )
}
