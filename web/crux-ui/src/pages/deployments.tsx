import { Layout } from '@app/components/layout'
import DeploymentStatusTag from '@app/components/products/versions/deployments/deployment-status-tag'
import useCopyDeploymentModal from '@app/components/products/versions/deployments/use-copy-deployment-confirmation-modal'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import Filters from '@app/components/shared/filters'
import PageHeading from '@app/components/shared/page-heading'
import AnchorAction from '@app/elements/dyo-anchor-action'
import { DyoCard } from '@app/elements/dyo-card'
import DyoFilterChips from '@app/elements/dyo-filter-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoList } from '@app/elements/dyo-list'
import DyoModal, { DyoConfirmationModal } from '@app/elements/dyo-modal'
import { defaultApiErrorHandler } from '@app/errors'
import useAnchorActions from '@app/hooks/use-anchor-actions'
import { EnumFilter, enumFilterFor, TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import { Deployment, deploymentIsCopyable, DeploymentStatus, DEPLOYMENT_STATUS_VALUES } from '@app/models'
import { deploymentUrl, nodeUrl, productUrl, ROUTE_DEPLOYMENTS, versionUrl } from '@app/routes'
import { utcDateToLocale, withContextAuthorization } from '@app/utils'
import { cruxFromContext } from '@server/crux/crux'
import clsx from 'clsx'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'

interface DeploymentsPageProps {
  deployments: Deployment[]
}

type DeploymentFilter = TextFilter & EnumFilter<DeploymentStatus>

const DeploymentsPage = (props: DeploymentsPageProps) => {
  const { deployments } = props
  const { t } = useTranslation('deployments')
  const router = useRouter()

  const [showInfo, setShowInfo] = useState<Deployment>(null)

  const handleApiError = defaultApiErrorHandler(t)
  const [confirmationModal, copyDeployment] = useCopyDeploymentModal(handleApiError)

  const onCopyDeployment = async (deploymentId: string) => {
    const deployment = deployments.find(d => d.id === deploymentId)
    const url = await copyDeployment({
      deploymentId: deployment.id,
      productId: deployment.productId,
      versionId: deployment.versionId,
    })

    if (!url) {
      return
    }

    router.push(url)
  }

  const anchors = useAnchorActions(
    Object.fromEntries(deployments.map(it => [`copyDeployment-${it.id}`, () => onCopyDeployment(it.id)])),
  )

  const filters = useFilters<Deployment, DeploymentFilter>({
    filters: [
      textFilterFor<Deployment>(it => [it.product, it.version, it.node, it.prefix]),
      enumFilterFor<Deployment, DeploymentStatus>(it => [it.status]),
    ],
    initialData: deployments,
  })

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
    <Link href={productUrl(item.productId)}>
      <a className="cursor-pointer">{item.product}</a>
    </Link>,
    <Link href={versionUrl(item.productId, item.versionId)}>
      <a className="cursor-pointer">{item.version}</a>
    </Link>,
    <Link href={nodeUrl(item.nodeId)}>
      <a className="cursor-pointer">{item.node}</a>
    </Link>,
    <a>{item.prefix}</a>,
    <a>{utcDateToLocale(item.updatedAt)}</a>,
    <DeploymentStatusTag status={item.status} className="w-fit mx-auto" />,
    <>
      <div className="mr-2 inline-block">
        <Link href={deploymentUrl(item.productId, item.versionId, item.id)}>
          <a>
            <Image src="/eye.svg" alt={t('common:deploy')} width={24} height={24} className="cursor-pointer" />
          </a>
        </Link>
      </div>
      <div className="mr-2 inline-block">
        <Image
          src="/note.svg"
          alt={t('common:deploy')}
          width={24}
          height={24}
          className={!!item.note && item.note.length > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-30'}
          onClick={() => !!item.note && item.note.length > 0 && setShowInfo(item)}
        />
      </div>

      <AnchorAction
        href={`copyDeployment-${item.id}`}
        anchors={anchors}
        disabled={!deploymentIsCopyable(item.status, item.type)}
      >
        <Image
          src="/copy.svg"
          alt={t('common:copy')}
          width={24}
          height={24}
          className={deploymentIsCopyable(item.status, item.type) ? 'cursor-pointer' : 'cursor-not-allowed opacity-30'}
        />
      </AnchorAction>
    </>,
  ]
  /* eslint-enable react/jsx-key */

  return (
    <Layout title={t('common:deployments')}>
      <PageHeading pageLink={selfLink} />
      {deployments.length ? (
        <>
          <Filters setTextFilter={it => filters.setFilter({ text: it })}>
            <DyoFilterChips
              className="pl-6"
              choices={DEPLOYMENT_STATUS_VALUES}
              converter={it => t(`common:deploymentStatuses.${it}`)}
              onSelectionChange={type => {
                filters.setFilter({
                  enum: type,
                })
              }}
            />
          </Filters>
          <DyoCard className="relative mt-4">
            <DyoList
              headers={[...headers.map(h => t(h)), '']}
              headerClassName={headerClasses}
              itemClassName="h-11 min-h-min text-light-eased pl-4 w-fit"
              data={filters.filtered}
              noSeparator
              itemBuilder={itemTemplate}
            />
          </DyoCard>
        </>
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

      <DyoConfirmationModal config={confirmationModal} className="w-1/4" confirmColor="bg-error-red" />
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
