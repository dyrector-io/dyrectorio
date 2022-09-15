import { Layout } from '@app/components/layout'
import DeploymentStatusTag from '@app/components/products/versions/deployments/deployment-status-tag'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoList } from '@app/elements/dyo-list'
import DyoModal from '@app/elements/dyo-modal'
import { Deployment } from '@app/models'
import { deploymentUrl, nodeUrl, productUrl, ROUTE_DEPLOYMENTS, versionUrl } from '@app/routes'
import { utcDateToLocale, withContextAuthorization } from '@app/utils'
import { cruxFromContext } from '@server/crux/crux'
import clsx from 'clsx'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useState } from 'react'

interface DeploymentsPageProps {
  deployments: Deployment[]
}

const DeploymentsPage = (props: DeploymentsPageProps) => {
  const { deployments } = props
  const { t } = useTranslation('deployments')
  const router = useRouter()

  const [showInfo, setShowInfo] = useState<Deployment>(null)

  const selfLink: BreadcrumbLink = {
    name: t('common:deployments'),
    url: ROUTE_DEPLOYMENTS,
  }

  const headers = [
    'common:product',
    'common:version',
    'common:node',
    'common:prefix',
    'common:updatedAt',
    'common:status',
  ]
  const defaultHeaderClass = 'h-11 uppercase text-bright text-sm bg-medium-eased py-3 pl-4 font-semibold'
  const headerClasses = [
    clsx('rounded-tl-lg', defaultHeaderClass),
    ...Array.from({ length: headers.length - 2 }).map(() => defaultHeaderClass),
    clsx('text-center', defaultHeaderClass),
    clsx('rounded-tr-lg', defaultHeaderClass),
  ]

  const itemTemplate = (item: Deployment) => /* eslint-disable react/jsx-key */ [
    <a className="cursor-pointer" onClick={() => router.push(productUrl(item.productId))}>
      {item.product}
    </a>,
    <a className="cursor-pointer" onClick={() => router.push(versionUrl(item.productId, item.versionId))}>
      {item.version}
    </a>,
    <a className="cursor-pointer" onClick={() => router.push(nodeUrl(item.nodeId))}>
      {item.node}
    </a>,
    <a>{item.prefix}</a>,
    <a>{utcDateToLocale(item.updatedAt)}</a>,
    <DeploymentStatusTag status={item.status} className="w-fit mx-auto" />,
    <>
      <div className="mr-2 inline-block">
        <Image
          src="/eye.svg"
          alt={t('common:deploy')}
          width={24}
          height={24}
          className="cursor-pointer"
          onClick={() => router.push(deploymentUrl(item.productId, item.versionId, item.id))}
        />
      </div>
      <Image
        src="/note.svg"
        alt={t('common:deploy')}
        width={24}
        height={24}
        className={!!item.note && item.note.length > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-30'}
        onClick={() => !!item.note && item.note.length > 0 && setShowInfo(item)}
      />
    </>,
  ]
  /* eslint-enable react/jsx-key */

  return (
    <Layout title={t('common:deployments')}>
      <PageHeading pageLink={selfLink} />
      {deployments.length ? (
        <DyoCard className="relative">
          <DyoList
            headers={[...headers.map(h => t(h)), '']}
            headerClassName={headerClasses}
            itemClassName="h-11 min-h-min text-light-eased pl-4 w-fit"
            data={deployments}
            noSeparator
            itemBuilder={itemTemplate}
          />
        </DyoCard>
      ) : (
        <DyoHeading element="h3" className="text-md text-center text-light-eased pt-32">
          {t('noItems')}
        </DyoHeading>
      )}
      {!showInfo ? null : (
        <DyoModal
          className="w-1/2 h-1/2"
          titleClassName="pl-4 font-medium text-xl text-bright mb-3"
          title={t('common:note')}
          open={!!showInfo}
          onClose={() => setShowInfo(null)}
        >
          <p className="text-bright mt-8 break-all overflow-y-auto">{showInfo.note}</p>
        </DyoModal>
      )}
    </Layout>
  )
}

export default DeploymentsPage

const getPageServerSideProps = async (context: NextPageContext) => ({
  props: {
    deployments: await cruxFromContext(context).deployments.getAll(),
  },
})

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
