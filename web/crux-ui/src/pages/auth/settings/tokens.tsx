import { Layout } from '@app/components/layout'
import CreateTokenCard from '@app/components/settings/create-token-card'
import ShowTokenCard from '@app/components/settings/show-token-card'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import Filters from '@app/components/shared/filters'
import PageHeading from '@app/components/shared/page-heading'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoIcon from '@app/elements/dyo-icon'
import { DyoConfirmationModal } from '@app/elements/dyo-modal'
import DyoTable, { DyoColumn, sortDate, sortString } from '@app/elements/dyo-table'
import useConfirmation from '@app/hooks/use-confirmation'
import { TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import { GeneratedToken, Token } from '@app/models'
import { appendTeamSlug } from '@app/providers/team-routes'
import { API_TOKENS, ROUTE_INDEX, ROUTE_SETTINGS, ROUTE_SETTINGS_EDIT_PROFILE, tokensApiUrl } from '@app/routes'
import { redirectTo, teamSlugOrFirstTeam, utcDateToLocale, withContextAuthorization } from '@app/utils'
import { getCruxFromContext } from '@server/crux-api'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
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

  const onItemDelete = async (item: Token) => {
    const confirmed = await confirmDelete({
      title: t('common:areYouSureDeleteName', { name: item.name }),
      description: t('common:proceedYouLoseAllDataToName', {
        name: item.name,
      }),
      confirmText: t('common:delete'),
      confirmColor: 'bg-error-red',
    })

    if (!confirmed) {
      return
    }

    const res = await fetch(tokensApiUrl(item.id), {
      method: 'DELETE',
    })

    if (res.ok) {
      if (showToken?.id === item.id) {
        setShowToken(null)
      }

      const index = filters.items.indexOf(item)
      const filterItems = filters.items
      filterItems.splice(index, 1)
      filters.setItems([...filterItems])
    } else {
      toast(t('errors:oops'))
    }
  }

  const pageLink: BreadcrumbLink = {
    name: t('common:tokens'),
    url: ROUTE_SETTINGS,
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
            <DyoTable data={filters.filtered}>
              <DyoColumn header={t('common:name')} field="name" width="60%" sortable sort={sortString} />
              <DyoColumn
                header={t('common:createdAt')}
                body={(it: Token) => utcDateToLocale(it.createdAt)}
                suppressHydrationWarning
                sortable
                sortField="createdAt"
                sort={sortDate}
              />
              <DyoColumn
                header={t('tokens:expiresAt')}
                body={(it: Token) => (it.expiresAt ? utcDateToLocale(it.expiresAt) : t('common:never'))}
                suppressHydrationWarning
                sortable
                sortField="expiresAt"
                sort={sortDate}
              />
              <DyoColumn
                header={t('common:actions')}
                width="10%"
                align="center"
                body={(it: Token) => (
                  <DyoIcon
                    className="aspect-square cursor-pointer"
                    src="/trash-can.svg"
                    alt={t('common:delete')}
                    size="md"
                    onClick={() => onItemDelete(it)}
                  />
                )}
              />
            </DyoTable>
          </DyoCard>
        </>
      ) : (
        <DyoHeading element="h3" className="text-md text-center text-light-eased pt-32">
          {t('noTokens')}
        </DyoHeading>
      )}

      <DyoConfirmationModal config={deleteModalConfig} className="w-1/4" />
    </Layout>
  )
}

export default TokensPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const tokens = await getCruxFromContext<Token[]>(context, API_TOKENS)

  const teamSlug = await teamSlugOrFirstTeam(context)
  if (!teamSlug) {
    return redirectTo(ROUTE_INDEX)
  }

  return {
    props: appendTeamSlug(teamSlug, {
      tokens,
    }),
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
