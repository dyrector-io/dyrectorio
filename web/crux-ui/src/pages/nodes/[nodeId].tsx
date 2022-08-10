import { Layout, PageHead } from '@app/components/layout'
import DyoNodeCard from '@app/components/nodes/dyo-node-card'
import EditNodeCard from '@app/components/nodes/edit-node-card'
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
  const { t } = useTranslation('nodes')

  const router = useRouter()

  const [node, setNode] = useState(props.node)
  const [editing, setEditing] = useState(false)
  const submitRef = useRef<() => Promise<any>>()

  const handleApiError = defaultApiErrorHandler(t)

  const onNodeEdited = (node: DyoNodeDetails, shouldClose?: boolean) => {
    if (shouldClose) {
      setEditing(false)
    }
    setNode(node)
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
    name: t('common:node'),
    url: ROUTE_NODES,
  }

  return (
    <Layout>
      <PageHead title={t('title-node', { name: node.name })} />
      <PageHeading
        pageLink={pageLink}
        subLinks={[
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
          deleteModalDescription={t('common:defaultDeleteDescription', {
            name: node.name,
          })}
        />
      </PageHeading>

      {!editing ? (
        <DyoNodeCard node={node} />
      ) : (
        <EditNodeCard className="p-8" node={node} onNodeEdited={onNodeEdited} submitRef={submitRef} />
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
