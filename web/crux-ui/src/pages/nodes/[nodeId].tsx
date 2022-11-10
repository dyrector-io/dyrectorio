import { Layout } from '@app/components/layout'
import DyoNodeCard from '@app/components/nodes/dyo-node-card'
import EditNodeCard from '@app/components/nodes/edit-node-card'
import NodeConnectionCard from '@app/components/nodes/node-connection-card'
import useNodeState from '@app/components/nodes/use-node-state'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { DetailsPageMenu } from '@app/components/shared/page-menu'
import { defaultApiErrorHandler } from '@app/errors'
import { DyoNodeDetails } from '@app/models'
import { nodeApiUrl, nodeUrl, ROUTE_NODES } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { cruxFromContext } from '@server/crux/crux'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import { useRef, useState } from 'react'

interface NodeDetailsProps {
  node: DyoNodeDetails
}

const NodeDetails = (props: NodeDetailsProps) => {
  const { node: propsNode } = props

  const { t } = useTranslation('nodes')

  const router = useRouter()

  const [node, setNode] = useNodeState(propsNode)
  const [editing, setEditing] = useState(false)
  const submitRef = useRef<() => Promise<any>>()

  const handleApiError = defaultApiErrorHandler(t)

  const onNodeEdited = (item: DyoNodeDetails, shouldClose?: boolean) => {
    if (shouldClose) {
      setEditing(false)
    }
    setNode(item)
  }

  const onDelete = async () => {
    const res = await fetch(nodeApiUrl(node.id), {
      method: 'DELETE',
    })

    if (!res.ok) {
      handleApiError(res)
      return
    }

    router.back()
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
          editing={editing}
          setEditing={setEditing}
          submitRef={submitRef}
          deleteModalTitle={t('common:confirmDelete', { name: node.name })}
          deleteModalDescription={t('common:deleteDescription', {
            name: node.name,
          })}
        />
      </PageHeading>

      {!editing ? (
        <div className="flex flex-row gap-4">
          <DyoNodeCard className="w-2/3 p-6" node={node} hideConnectionInfo />

          <NodeConnectionCard className="w-1/3 px-6 py-4" node={node} />
        </div>
      ) : (
        <EditNodeCard node={node} onNodeEdited={onNodeEdited} submitRef={submitRef} />
      )}
    </Layout>
  )
}

export default NodeDetails

const getPageServerSideProps = async (context: NextPageContext) => {
  const nodeId = context.query.nodeId as string

  const res = await cruxFromContext(context).nodes.getNodeDetails(nodeId)

  return {
    props: {
      node: res,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
