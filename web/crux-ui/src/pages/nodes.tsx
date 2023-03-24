import { Layout } from '@app/components/layout'
import DyoNodeCard from '@app/components/nodes/dyo-node-card'
import EditNodeCard from '@app/components/nodes/edit-node-card'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import Filters from '@app/components/shared/filters'
import PageHeading from '@app/components/shared/page-heading'
import { ListPageMenu } from '@app/components/shared/page-menu'
import DyoFilterChips from '@app/elements/dyo-filter-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoWrap from '@app/elements/dyo-wrap'
import { EnumFilter, enumFilterFor, TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import useWebSocket from '@app/hooks/use-websocket'
import { Node, NodeStatus, NodeStatusMessage, WS_TYPE_NODE_STATUS } from '@app/models'
import { API_NODES, nodeUrl, ROUTE_NODES, WS_NODES } from '@app/routes'
import { fetchCrux, upsertById, withContextAuthorization } from '@app/utils'
import clsx from 'clsx'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useSWRConfig } from 'swr'

interface NodesPageProps {
  nodes: Node[]
}

const nodeStatusFilters = ['connected', 'unreachable'] as const

type NodeFilter = TextFilter & EnumFilter<NodeStatus>

const NodesPage = (props: NodesPageProps) => {
  const { nodes } = props

  const { t } = useTranslation('nodes')

  const { mutate } = useSWRConfig()

  const filters = useFilters<Node, NodeFilter>({
    filters: [
      textFilterFor<Node>(it => [it.address, it.name, it.description, it.status, it.icon]),
      enumFilterFor<Node, NodeStatus>(it => [it.status]),
    ],
    initialData: nodes,
  })

  const [creating, setCreating] = useState(false)
  const submitRef = useRef<() => Promise<any>>()

  const socket = useWebSocket(WS_NODES, {
    onError: _ => {
      toast(t('errors:connectionLost'))
    },
  })

  socket.on(WS_TYPE_NODE_STATUS, (message: NodeStatusMessage) => {
    const newNode = {
      id: message.nodeId,
      name: '',
      description: '',
      type: 'docker',
      address: message.address,
      status: message.status,
      createdAt: new Date().toUTCString(),
      updating: message.updating,
    } as Node

    const newNodes = upsertById(filters.items, newNode, {
      onUpdate: old => ({
        ...old,
        address: message.address ?? old.address,
        status: message.status,
      }),
    })

    filters.setItems(newNodes)
  })

  const onCreated = async (item: Node) => {
    const newNodes = upsertById(filters.items, item, {
      onUpdate: old => ({
        ...item,
        address: old.address,
        status: item.status ?? old.status,
      }),
    })

    filters.setItems(newNodes)
    await mutate(API_NODES, null)
  }
  const pageLink: BreadcrumbLink = {
    name: t('common:nodes'),
    url: ROUTE_NODES,
  }

  return (
    <Layout title={t('common:nodes')}>
      <PageHeading pageLink={pageLink}>
        <ListPageMenu creating={creating} setCreating={setCreating} submitRef={submitRef} />
      </PageHeading>

      {!creating ? null : <EditNodeCard className="mb-4" submitRef={submitRef} onNodeEdited={onCreated} />}
      {filters.items.length ? (
        <>
          <Filters setTextFilter={it => filters.setFilter({ text: it })}>
            <DyoFilterChips
              className="pl-6"
              choices={nodeStatusFilters}
              converter={it => t(`statusFilters.${it}`)}
              selection={filters.filter?.enum}
              onSelectionChange={type => {
                filters.setFilter({
                  enum: type,
                })
              }}
            />
          </Filters>

          <DyoWrap itemClassName="lg:w-1/2 xl:w-1/3">
            {filters.filtered.map((it, index) => {
              const modulo3Class = index % 3 === 1 ? 'xl:mx-4' : null
              const modulo2Class = clsx(index % 2 > 0 ? 'lg:ml-2' : 'lg:mr-2', modulo3Class ?? 'xl:mx-0')

              return (
                <DyoNodeCard
                  className={clsx('max-h-72 w-full p-8 my-2', modulo3Class, modulo2Class)}
                  key={`node-${index}`}
                  node={it}
                  titleHref={nodeUrl(it.id)}
                />
              )
            })}
          </DyoWrap>
        </>
      ) : (
        <DyoHeading element="h3" className="text-md text-center text-light-eased pt-32">
          {t('noItems')}
        </DyoHeading>
      )}
    </Layout>
  )
}

export default NodesPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const res = await fetchCrux(context, API_NODES)
  const nodes = (await res.json()) as Node[]

  return {
    props: {
      nodes,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
