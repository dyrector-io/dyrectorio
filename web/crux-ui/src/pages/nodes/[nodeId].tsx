import { Layout } from '@app/components/layout'
import DyoNodeCard from '@app/components/nodes/dyo-node-card'
import EditNodeCard from '@app/components/nodes/edit-node-card'
import NodeAuditList from '@app/components/nodes/node-audit-list'
import NodeConnectionCard from '@app/components/nodes/node-connection-card'
import NodeContainersList from '@app/components/nodes/node-containers-list'
import NodeSectionsHeading from '@app/components/nodes/node-sections-heading'
import useNodeDetailsState from '@app/components/nodes/use-node-details-state'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import Filters from '@app/components/shared/filters'
import PageHeading from '@app/components/shared/page-heading'
import { DetailsPageMenu } from '@app/components/shared/page-menu'
import { DyoConfirmationModal } from '@app/elements/dyo-modal'
import { defaultApiErrorHandler } from '@app/errors'
import { NodeDetails } from '@app/models'
import { API_NODES, nodeApiUrl, nodeUrl, ROUTE_NODES } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { getCruxFromContext } from '@server/crux-api'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import { useRef } from 'react'
import { useSWRConfig } from 'swr'

interface NodeDetailsPageProps {
  node: NodeDetails
}

const NodeDetailsPage = (props: NodeDetailsPageProps) => {
  const { node: propsNode } = props

  const { t } = useTranslation('nodes')

  const { mutate } = useSWRConfig()

  const router = useRouter()

  const [state, actions] = useNodeDetailsState({
    node: propsNode,
  })
  const submitRef = useRef<() => Promise<any>>()

  const { node } = state

  const handleApiError = defaultApiErrorHandler(t)

  const onDelete = async () => {
    const res = await fetch(nodeApiUrl(node.id), {
      method: 'DELETE',
    })

    if (!res.ok) {
      handleApiError(res)
      return
    }

    await mutate(API_NODES, null)
    router.push(ROUTE_NODES)
  }

  const pageLink: BreadcrumbLink = {
    name: t('common:nodes'),
    url: ROUTE_NODES,
  }

  return (
    <Layout title={t('nodesName', node)}>
      <PageHeading
        pageLink={pageLink}
        sublinks={[
          {
            name: node.name,
            url: `${nodeUrl(node.id)}`,
          },
        ]}
      >
        <DetailsPageMenu
          onDelete={onDelete}
          editing={state.section === 'editing'}
          setEditing={actions.setEditing}
          submitRef={submitRef}
          deleteModalTitle={t('common:areYouSureDeleteName', { name: node.name })}
          deleteModalDescription={t('common:proceedYouLoseAllDataToName', {
            name: node.name,
          })}
        />
      </PageHeading>

      {state.section === 'editing' ? (
        <EditNodeCard node={node} onNodeEdited={actions.onNodeEdited} submitRef={submitRef} />
      ) : (
        <>
          <div className="flex flex-row gap-4 mb-4">
            <DyoNodeCard className="w-2/3 p-6" node={node} hideConnectionInfo />

            <NodeConnectionCard className="w-1/3 px-6 py-4" node={node} />
          </div>

          <NodeSectionsHeading section={state.section} setSection={actions.setSection} />

          {state.section === 'containers' ? (
            <>
              <Filters setTextFilter={it => state.containerFilters.setFilter({ text: it })} />

              <NodeContainersList state={state} actions={actions} />
            </>
          ) : (
            <NodeAuditList node={node} />
          )}
        </>
      )}

      {!state.confirmationModal ? null : (
        <DyoConfirmationModal config={state.confirmationModal} confirmColor="bg-error-red" />
      )}
    </Layout>
  )
}

export default NodeDetailsPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const nodeId = context.query.nodeId as string

  const node = await getCruxFromContext<NodeDetails>(context, nodeApiUrl(nodeId))

  return {
    props: {
      node,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
