import { Layout } from '@app/components/layout'
import DeploymentStatusTag from '@app/components/products/versions/deployments/deployment-status-tag'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoList } from '@app/elements/dyo-list'
import { Deployment } from '@app/models'
import { deploymentUrl, nodeUrl, productUrl, ROUTE_DEPLOYMENTS, versionUrl } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { cruxFromContext } from '@server/crux/crux'
import clsx from 'clsx'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { useRouter } from 'next/router'

interface DeploymentsPageProps {
  deployments: Deployment[]
}

const DeploymentsPage = (props: DeploymentsPageProps) => {
  const { t } = useTranslation('deployments')
  const router = useRouter()

  const selfLink: BreadcrumbLink = {
    name: t('common:deployments'),
    url: ROUTE_DEPLOYMENTS,
  }

  const headers = ['common:deployment', 'common:product', 'common:version', 'common:node', 'common:status']
  const defaultHeaderClass = 'h-11 uppercase text-bright text-sm bg-medium-eased py-3 pl-4 font-semibold'
  const headerClasses = [
    clsx('rounded-tl-lg', defaultHeaderClass),
    ...Array.from({ length: headers.length - 2 }).map(() => defaultHeaderClass),
    clsx('text-center', defaultHeaderClass),
    clsx('rounded-tr-lg', defaultHeaderClass),
  ]

  return (
    <Layout title={t('common:deployments')}>
      <PageHeading pageLink={selfLink} />
      <DyoCard className="relative">
        <DyoList
          headers={[...headers.map(h => t(h)), '']}
          headerClassName={headerClasses}
          itemClassName="h-11 min-h-min text-light-eased pl-4 w-fit"
          data={props.deployments}
          noSeparator
          itemBuilder={it => {
            /* eslint-disable react/jsx-key */
            return [
              it.name,
              <a className="cursor-pointer" onClick={() => router.push(productUrl(it.productId))}>
                {it.product}
              </a>,
              <a className="cursor-pointer" onClick={() => router.push(versionUrl(it.productId, it.versionId))}>
                {it.version}
              </a>,
              <a className="cursor-pointer" onClick={() => router.push(nodeUrl(it.nodeId))}>
                {it.node}
              </a>,
              <DeploymentStatusTag status={it.status} className="w-fit mx-auto" />,
              <Image
                src="/eye.svg"
                alt={t('common:deploy')}
                width={24}
                height={24}
                className="mr-8 cursor-pointer"
                onClick={() => router.push(deploymentUrl(it.productId, it.versionId, it.id))}
              />,
            ]
            /* eslint-enable react/jsx-key */
          }}
        />
      </DyoCard>
    </Layout>
  )
}

export default DeploymentsPage

const getPageServerSideProps = async (context: NextPageContext) => {
  return {
    props: {
      deployments: await cruxFromContext(context).deployments.getAll(),
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
