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
import { DyoNode, NodeEventMessage, NodeStatus, WS_TYPE_NODE_EVENT } from '@app/models'
import { API_NODES, nodeUrl, ROUTE_NODES, WS_NODES } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { getCruxFromContext } from '@server/crux-api'
import clsx from 'clsx'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useSWRConfig } from 'swr'

interface NodesPageProps {
  nodes: DyoNode[]
}

const nodeStatusFilters = ['connected', 'unreachable'] as const

type NodeFilter = TextFilter & EnumFilter<NodeStatus>

const NodesPage = (props: NodesPageProps) => {
  const { nodes } = props

  const { t } = useTranslation('nodes')

  const { mutate } = useSWRConfig()

  const filters = useFilters<DyoNode, NodeFilter>({
    filters: [
      textFilterFor<DyoNode>(it => [it.address, it.name, it.description, it.status, it.icon]),
      enumFilterFor<DyoNode, NodeStatus>(it => [it.status]),
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

  socket.on(WS_TYPE_NODE_EVENT, (message: NodeEventMessage) => {
    const index = filters.items.findIndex(it => it.id === message.id)
    if (index < 0) {
      return
    }

    const old = filters.items[index]
    const node = {
      ...old,
      ...message,
    }

    const newNodes = [...filters.items]
    newNodes[index] = node

    filters.setItems(newNodes)
  })

  const onNodeEdited = async (node: DyoNode) => {
    const newNodes = [...filters.items]
    const index = filters.items.findIndex(it => it.id === node.id)

    if (index < 0) {
      newNodes.push(node)
    } else {
      const old = filters.items[index]
      const newNode = {
        ...old,
        ...node,
      }
      newNodes[index] = newNode
    }

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

      {!creating ? null : <EditNodeCard className="mb-4" submitRef={submitRef} onNodeEdited={onNodeEdited} />}
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
  const nodes = await getCruxFromContext<DyoNode[]>(context, API_NODES)

  return {
    props: {
      nodes,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
