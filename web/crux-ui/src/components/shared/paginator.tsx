import DyoButton from '@app/elements/dyo-button'
import DyoIcon from '@app/elements/dyo-icon'
import { DyoInput } from '@app/elements/dyo-input'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { useEffect, useState } from 'react'

type PaginationType = 'first' | 'last' | 'next' | 'previous'
export const pageSizes = [5, 10, 20, 50, 100, 250] as const
export type PaginationSettings = {
  pageSize: (typeof pageSizes)[number]
  pageNumber: number
}
export interface PaginatorProps {
  length: number
  defaultPagination: PaginationSettings
  onChanged: (settings: PaginationSettings) => void
}
export type ChangePageProps = { type: PaginationType } | { type: 'exact'; page: number }

const Paginator = (props: PaginatorProps) => {
  const { length, defaultPagination, onChanged } = props

  const { t } = useTranslation('common')

  const [pagination, setPagination] = useState(defaultPagination)

  useEffect(() => {
    setPagination({ ...pagination, pageNumber: 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length])

  const maxPage = Math.ceil(length / pagination.pageSize) - 1
  const pageFrom = length > 0 ? pagination.pageSize * pagination.pageNumber + 1 : 0
  const pageTo = pageFrom + pagination.pageSize - 1 > length ? length : pageFrom + pagination.pageSize - 1
  const disabled = length === 0

  const getNextPageNumber = (p: ChangePageProps): number => {
    switch (p.type) {
      case 'first': {
        return 0
      }
      case 'last': {
        return maxPage
      }
      case 'next': {
        return pagination.pageNumber + 1 <= maxPage ? pagination.pageNumber + 1 : maxPage
      }
      case 'previous': {
        return pagination.pageNumber - 1 >= 0 ? pagination.pageNumber - 1 : 0
      }
      case 'exact': {
        if (Number.isNaN(p.page)) return 0

        return Math.max(0, Math.min(p.page, maxPage))
      }
      default:
        return 0
    }
  }

  const onPageChanged = (p: ChangePageProps) => {
    const newPagination = { ...pagination, pageNumber: getNextPageNumber(p) }
    setPagination(newPagination)
    onChanged(newPagination)
  }

  return (
    <div className="flex justify-between my-2 items-center">
      <div>
        <a className="text-light-eased mx-4">{t('itemsPerPage')}</a>
        <select
          className="bg-transparent h-8 ring-2 ring-light-grey rounded-md text-slate-500 focus:outline-none"
          onChange={e => {
            const newMaxPage = Math.ceil(length / pageSizes[e.target.value]) - 1
            const newPagination: PaginationSettings = {
              pageSize: pageSizes[e.target.value],
              pageNumber: Math.min(newMaxPage, pagination.pageNumber),
            }

            setPagination(newPagination)
            onChanged(newPagination)
          }}
          value={pageSizes.indexOf(pagination.pageSize)}
        >
          {pageSizes.map((v, i) => (
            <option key={v} value={i} className="bg-medium">
              {v}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center mx-4">
        <a className="text-light-eased mr-8">{t('showingItems', { pageFrom, pageTo, total: length })}</a>
        <DyoButton
          className="w-8 text-xl"
          onClick={() => onPageChanged({ type: 'first' })}
          text
          thin
          disabled={disabled}
        >
          <DyoIcon className="aspect-square h-6 m-auto" src="/carets_left.svg" size="md" alt="carets left" />
        </DyoButton>
        <DyoButton
          className="w-8 text-xl"
          onClick={() => onPageChanged({ type: 'previous' })}
          text
          thin
          disabled={disabled}
        >
          <DyoIcon className="aspect-square h-6 m-auto" src="/caret_left.svg" size="md" alt="caret left" />
        </DyoButton>
        {pagination.pageNumber - 2 >= 0 && (
          <DyoButton
            className="w-8 text-l text-light-eased"
            onClick={() => onPageChanged({ type: 'exact', page: pagination.pageNumber - 2 })}
            text
            thin
            disabled={disabled}
          >
            {pagination.pageNumber - 1}
          </DyoButton>
        )}
        {pagination.pageNumber - 1 >= 0 && (
          <DyoButton
            className="w-8 text-l text-light-eased"
            onClick={() => onPageChanged({ type: 'previous' })}
            text
            thin
            disabled={disabled}
          >
            {pagination.pageNumber}
          </DyoButton>
        )}
        <DyoInput
          className="w-10 h-10 bg-dyo-turquoise rounded-full text-center !text-white font-semibold p-0"
          value={pagination.pageNumber + 1}
          onChange={e => onPageChanged({ type: 'exact', page: Number(e.target.value) - 1 })}
          grow
          disabled={disabled}
        />
        {pagination.pageNumber + 1 <= maxPage && (
          <DyoButton
            className="w-8 text-l text-light-eased"
            onClick={() => onPageChanged({ type: 'next' })}
            text
            thin
            disabled={disabled}
          >
            {pagination.pageNumber + 2}
          </DyoButton>
        )}
        {pagination.pageNumber + 2 <= maxPage && (
          <DyoButton
            className="w-8 text-l text-light-eased"
            onClick={() => onPageChanged({ type: 'exact', page: pagination.pageNumber + 2 })}
            text
            thin
            disabled={disabled}
          >
            {pagination.pageNumber + 3}
          </DyoButton>
        )}
        <DyoButton
          className="w-8 text-xl"
          onClick={() => onPageChanged({ type: 'next' })}
          text
          thin
          disabled={disabled}
        >
          <DyoIcon className="aspect-square h-6 m-auto" src="/caret_right.svg" size="md" alt="caret right" />
        </DyoButton>
        <DyoButton
          className="w-8 text-xl"
          onClick={() => onPageChanged({ type: 'last' })}
          text
          thin
          disabled={disabled}
        >
          <Image
            className="aspect-square h-6 m-auto"
            src="/carets_right.svg"
            width={24}
            height={24}
            alt="carets right"
          />
        </DyoButton>
      </div>
    </div>
  )
}

export default Paginator
