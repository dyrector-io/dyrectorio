import { Layout } from '@app/components/layout'
import CreateTokenCard from '@app/components/settings/create-token-card'
import ShowTokenCard from '@app/components/settings/show-token-card'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import Filters from '@app/components/shared/filters'
import PageHeading from '@app/components/shared/page-heading'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoList } from '@app/elements/dyo-list'
import { DyoConfirmationModal } from '@app/elements/dyo-modal'
import useConfirmation from '@app/hooks/use-confirmation'
import { TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import { GeneratedToken, Token } from '@app/models'
import { API_TOKENS, ROUTE_SETTINGS_EDIT_PROFILE, ROUTE_SETTINGS_TOKENS, tokensApiUrl } from '@app/routes'
import { utcDateToLocale, withContextAuthorization } from '@app/utils'
import { getCruxFromContext } from '@server/crux-api'
import clsx from 'clsx'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { toast } from 'react-hot-toast'

interface TokensPageProps {
  tokens: Token[]
}

const TokensPage = (props: TokensPageProps) => {
  const { tokens } = props

  const { t } = useTranslation('settings')

  const [showToken, setShowToken] = useState<GeneratedToken>(null)
  const [creating, setCreating] = useState(false)
  const submitRef = useRef<() => Promise<any>>()

  const [deleteModalConfig, confirmDelete] = useConfirmation()

  const filters = useFilters<Token, TextFilter>({
    initialData: tokens,
    filters: [
      textFilterFor<GeneratedToken>(it => [it.name, utcDateToLocale(it.createdAt), utcDateToLocale(it.expiresAt)]),
    ],
  })

  const onCreated = (token: GeneratedToken) => {
    setCreating(false)
    setShowToken(token)
    filters.setItems([...filters.items, token])
  }

  const onDelete = async (token: GeneratedToken) => {
    const res = await fetch(tokensApiUrl(token.id), {
      method: 'DELETE',
    })

    if (res.ok) {
      if (showToken?.id === token.id) {
        setShowToken(null)
      }

      const index = filters.items.indexOf(token)
      const filterItems = filters.items
      filterItems.splice(index, 1)
      filters.setItems([...filterItems])
    } else {
      toast(t('errors:oops'))
    }
  }

  const columnWidths = ['w-7/12', 'w-2/12', 'w-2/12', 'w-1/12']
  const headers = ['common:name', 'common:createdAt', 'tokens:expiresAt', 'common:actions']
  const defaultHeaderClass = 'uppercase text-bright text-sm font-semibold bg-medium-eased p-2 py-3 h-11'
  const headerClasses = [
    clsx('rounded-tl-lg pl-6', defaultHeaderClass),
    ...Array.from({ length: headers.length - 2 }).map(() => defaultHeaderClass),
    clsx('rounded-tr-lg text-center pr-6', defaultHeaderClass),
  ]
  const defaultItemClass = 'h-12 min-h-min text-light-eased p-2'
  const itemClasses = [
    clsx('pl-6', defaultItemClass),
    ...Array.from({ length: headers.length - 2 }).map(() => defaultItemClass),
    clsx('pr-6 text-center', defaultItemClass),
  ]

  const itemTemplate = (item: GeneratedToken) => [
    <a>{item.name}</a>,
    <a>{utcDateToLocale(item.createdAt)}</a>,
    <a>{utcDateToLocale(item.expiresAt)}</a>,
    <div className="flex flex-row justify-center">
      <Image
        className="cursor-pointer"
        src="/trash-can.svg"
        alt={t('common:view')}
        width={24}
        height={24}
        onClick={() => {
          confirmDelete(() => onDelete(item), {
            title: t('common:areYouSureDeleteName', { name: item.name }),
            description: t('common:proceedYouLoseAllDataToName', {
              name: item.name,
            }),
          })
        }}
      />
    </div>,
  ]

  const pageLink: BreadcrumbLink = {
    name: t('common:tokens'),
    url: ROUTE_SETTINGS_TOKENS,
  }

  const sublinks: BreadcrumbLink[] = [
    {
      name: t('editProfile'),
      url: ROUTE_SETTINGS_EDIT_PROFILE,
    },
  ]

  return (
    <Layout title={t('editProfile')}>
      <PageHeading pageLink={pageLink} sublinks={sublinks}>
        {showToken ? (
          <DyoButton className="ml-auto px-4" secondary onClick={() => setShowToken(null)}>
            {t('common:back')}
          </DyoButton>
        ) : !creating ? (
          <DyoButton className="ml-auto px-4" onClick={() => setCreating(true)}>
            {t('common:add')}
          </DyoButton>
        ) : (
          <>
            <DyoButton className="ml-auto px-4" secondary onClick={() => setCreating(false)}>
              {t('common:discard')}
            </DyoButton>

            <DyoButton className="px-4 ml-4" onClick={() => submitRef.current()}>
              {t('common:save')}
            </DyoButton>
          </>
        )}
      </PageHeading>

      {!creating ? null : (
        <CreateTokenCard className="mb-8 px-8 py-6" submitRef={submitRef} onTokenCreated={onCreated} />
      )}

      {!showToken ? null : <ShowTokenCard className="mb-4" token={showToken} />}

      {filters.items.length ? (
        <>
          <Filters setTextFilter={it => filters.setFilter({ text: it })} />
          <DyoCard className="relative mt-4">
            <DyoList
              headers={[...headers.map(h => t(h)), '']}
              headerClassName={headerClasses}
              columnWidths={columnWidths}
              itemClassName={itemClasses}
              data={filters.filtered}
              noSeparator
              itemBuilder={itemTemplate}
            />
          </DyoCard>
        </>
      ) : (
        <DyoHeading element="h3" className="text-md text-center text-light-eased pt-32">
          {t('noTokens')}
        </DyoHeading>
      )}

      <DyoConfirmationModal
        config={deleteModalConfig}
        confirmText={t('common:delete')}
        className="w-1/4"
        confirmColor="bg-error-red"
      />
    </Layout>
  )
}

export default TokensPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const tokens = await getCruxFromContext<Token[]>(context, API_TOKENS)

  return {
    props: {
      tokens,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
