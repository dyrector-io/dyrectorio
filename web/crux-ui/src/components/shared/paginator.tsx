import { DyoButton } from '@app/elements/dyo-button'
import { DyoInput } from '@app/elements/dyo-input'
import { pageSizes, PaginationConfig } from '@app/hooks/use-pagination'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'

export interface PaginatorProps<Item> {
  pagination: PaginationConfig<Item>
}

export type changePageProps = { type: 'first' | 'last' | 'next' | 'previous' } | { type: 'exact'; page: number }

const Paginator = <Item,>(props: PaginatorProps<Item>) => {
  const { pagination } = props

  const { t } = useTranslation('common')

  const maxPage = Math.ceil(pagination.items.length / pagination.pageData.pageSize) - 1

  const pageFrom = pagination.pageData.pageSize * pagination.pageData.currentPage + 1
  const pageTo =
    pageFrom + pagination.pageData.pageSize - 1 > pagination.items.length
      ? pagination.items.length
      : pageFrom + pagination.pageData.pageSize - 1

  const changePage = (p: changePageProps) => {
    switch (p.type) {
      case 'first': {
        pagination.setPageData({ ...pagination.pageData, currentPage: 0 })
        break
      }
      case 'last': {
        pagination.setPageData({ ...pagination.pageData, currentPage: maxPage })
        break
      }
      case 'next': {
        pagination.setPageData({
          ...pagination.pageData,
          currentPage: pagination.pageData.currentPage + 1 <= maxPage ? pagination.pageData.currentPage + 1 : maxPage,
        })
        break
      }
      case 'previous': {
        pagination.setPageData({
          ...pagination.pageData,
          currentPage: pagination.pageData.currentPage - 1 >= 0 ? pagination.pageData.currentPage - 1 : 0,
        })
        break
      }
      case 'exact': {
        if (isNaN(p.page)) break
        if (p.page > maxPage) p.page = maxPage
        else if (p.page < 0) p.page = 0
        pagination.setPageData({ ...pagination.pageData, currentPage: p.page })
        break
      }
    }
  }

  return (
    <div className="flex justify-between my-2 items-center">
      <div>
        <a className="text-light-eased mx-4">{t('itemsPerPage')}</a>
        <select
          className="bg-transparent h-8 ring-2 ring-light-grey rounded-md text-slate-500 focus:outline-none"
          onChange={e => {
            const newMaxPage = Math.ceil(pagination.items.length / pageSizes[e.target.value]) - 1
            if (newMaxPage < pagination.pageData.currentPage) {
              pagination.setPageData({
                currentPage: newMaxPage,
                pageSize: pageSizes[e.target.value],
              })
            } else {
              pagination.setPageData({
                ...pagination.pageData,
                pageSize: pageSizes[e.target.value],
              })
            }
          }}
          value={pageSizes.indexOf(pagination.pageData.pageSize)}
        >
          {pageSizes.map((v, i) => {
            return (
              <option key={v} value={i} className="bg-medium">
                {v}
              </option>
            )
          })}
        </select>
      </div>
      <div className="flex items-center mx-4">
        <a className="text-light-eased mr-8">
          {t('showingItems', { pageFrom: pageFrom, pageTo: pageTo, total: pagination.items.length })}
        </a>
        <DyoButton className="w-8 text-xl" onClick={() => changePage({ type: 'first' })} text thin>
          <Image src="/carets_left.svg" width={24} height={24} layout={'fixed'} className="h-6 m-auto" />
        </DyoButton>
        <DyoButton className="w-8 text-xl" onClick={() => changePage({ type: 'previous' })} text thin>
          <Image src="/caret_left.svg" width={24} height={24} layout={'fixed'} className="h-6 m-auto" />
        </DyoButton>
        {pagination.pageData.currentPage - 2 >= 0 && (
          <DyoButton
            className="w-8 text-l text-light-eased"
            onClick={() => changePage({ type: 'exact', page: pagination.pageData.currentPage - 2 })}
            text
            thin
          >
            {pagination.pageData.currentPage - 1}
          </DyoButton>
        )}
        {pagination.pageData.currentPage - 1 >= 0 && (
          <DyoButton className="w-8 text-l text-light-eased" onClick={() => changePage({ type: 'previous' })} text thin>
            {pagination.pageData.currentPage}
          </DyoButton>
        )}
        <DyoInput
          className="w-10 h-10 bg-dyo-turquoise rounded-full text-center !text-white font-semibold p-0"
          value={pagination.pageData.currentPage + 1}
          onChange={e => changePage({ type: 'exact', page: parseInt(e.target.value) - 1 })}
          grow
        />
        {pagination.pageData.currentPage + 1 <= maxPage && (
          <DyoButton className="w-8 text-l text-light-eased" onClick={() => changePage({ type: 'next' })} text thin>
            {pagination.pageData.currentPage + 2}
          </DyoButton>
        )}
        {pagination.pageData.currentPage + 2 <= maxPage && (
          <DyoButton
            className="w-8 text-l text-light-eased"
            onClick={() => changePage({ type: 'exact', page: pagination.pageData.currentPage + 2 })}
            text
            thin
          >
            {pagination.pageData.currentPage + 3}
          </DyoButton>
        )}
        <DyoButton className="w-8 text-xl" onClick={() => changePage({ type: 'next' })} text thin>
          <Image src="/caret_right.svg" width={24} height={24} layout={'fixed'} className="h-6 m-auto" />
        </DyoButton>
        <DyoButton className="w-8 text-xl" onClick={() => changePage({ type: 'last' })} text thin>
          <Image src="/carets_right.svg" width={24} height={24} layout={'fixed'} className="h-6 m-auto" />
        </DyoButton>
      </div>
    </div>
  )
}

export default Paginator
