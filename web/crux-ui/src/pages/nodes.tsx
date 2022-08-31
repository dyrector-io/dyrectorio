import { Layout } from '@app/components/layout'
import DyoNodeCard from '@app/components/nodes/dyo-node-card'
import EditNodeCard from '@app/components/nodes/edit-node-card'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { ListPageMenu } from '@app/components/shared/page-menu'
import { ROUTE_NODES, WS_NODES } from '@app/const'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import DyoWrap from '@app/elements/dyo-wrap'
import { TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import useWebSocket from '@app/hooks/use-websocket'
import { DyoNode, NodeStatusMessage, WS_TYPE_NODE_STATUS } from '@app/models'
import { nodeUrl } from '@app/routes'
import { upsertById, withContextAuthorization } from '@app/utils'
import { cruxFromContext } from '@server/crux/crux'
import clsx from 'clsx'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'

interface NodesPageProps {
  nodes: DyoNode[]
}

const NodesPage = (props: NodesPageProps) => {
  const { nodes } = props

  const router = useRouter()

  const { t } = useTranslation('nodes')

  const filters = useFilters<DyoNode, TextFilter>({
    filters: [textFilterFor<DyoNode>(it => [it.address, it.name, it.description, it.status, it.icon])],
    initialData: nodes,
    initialFilter: { text: '' },
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
    } as DyoNode

    const newNodes = upsertById(filters.items, newNode, {
      onUpdate: old => ({
        ...old,
        address: message.address ?? old.address,
        status: message.status,
      }),
    })

    filters.setItems(newNodes)
  })

  const onCreated = (node: DyoNode) => {
    const newNodes = upsertById(filters.items, node, {
      onUpdate: old => ({
        ...node,
        address: old.address,
        status: old.status,
      }),
    })

    filters.setItems(newNodes)
  }

  const pageLink: BreadcrumbLink = {
    name: t('common:nodes'),
    url: ROUTE_NODES,
  }

  const onNavigateToDetails = (id: string) => router.push(nodeUrl(id))

  return (
    <Layout title={t('common:nodes')}>
      <PageHeading pageLink={pageLink}>
        <ListPageMenu creating={creating} setCreating={setCreating} submitRef={submitRef} />
      </PageHeading>

      {!creating ? null : <EditNodeCard className="mb-2" submitRef={submitRef} onNodeEdited={onCreated} />}

      <DyoCard className="flex flex-col p-8">
        <DyoHeading element="h3" className="text-xl text-bright">
          {t('common:filters')}
        </DyoHeading>

        <div className="flex items-center mt-4">
          <DyoInput
            className="w-2/3"
            placeholder={t('common:search')}
            onChange={e => filters.setFilter({ text: e.target.value })}
          />
        </div>
      </DyoCard>

      <DyoWrap itemClassName="lg:w-1/2 xl:w-1/3">
        {filters.filtered.map((it, index) => {
          const modulo3Class = index % 3 === 1 ? 'xl:mx-4' : null
          const modulo2Class = clsx(index % 2 > 0 ? 'lg:ml-2' : 'lg:mr-2', modulo3Class ?? 'xl:mx-0')

          return (
            <DyoNodeCard
              className={clsx('max-h-72 w-full p-8 my-2', modulo3Class, modulo2Class)}
              key={`node-${index}`}
              node={it}
              onNameClick={() => onNavigateToDetails(it.id)}
            />
          )
        })}
      </DyoWrap>
    </Layout>
  )
}

export default NodesPage

const getPageServerSideProps = async (context: NextPageContext) => ({
  props: {
    nodes: await cruxFromContext(context).nodes.getAll(),
  },
})

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
