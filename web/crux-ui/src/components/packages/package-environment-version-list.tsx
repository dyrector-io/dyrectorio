import { DyoCard } from '@app/elements/dyo-card'
import DyoIcon from '@app/elements/dyo-icon'
import DyoImgButton from '@app/elements/dyo-img-button'
import DyoLink from '@app/elements/dyo-link'
import DyoTable, { DyoColumn, sortDate, sortString } from '@app/elements/dyo-table'
import useTeamRoutes from '@app/hooks/use-team-routes'
import {
  BasicDeployment,
  Deployment,
  PackageEnvironmentDetails,
  PackageVersion,
  PackageVersionChainDetails,
} from '@app/models'
import { utcDateToLocale } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'
import CreatePackageDeploymentModal from './create-package-deployment-modal'

const latestNameOf = (chain: PackageVersionChainDetails): string => {
  const version = chain.versions.at(-1)
  return version?.name ?? ''
}

const currentVersionOf = (chain: PackageVersionChainDetails): PackageVersion | null =>
  chain.versions.findLast(it => it.deployment?.status === 'successful') ?? null

const currentVersionNameOf = (chain: PackageVersionChainDetails): string => currentVersionOf(chain)?.name ?? ''

const currentSuccessfulDeploymentOf = (chain: PackageVersionChainDetails): BasicDeployment | null => {
  const version = currentVersionOf(chain)
  return version?.deployment ?? null
}

const lastestDeploymentOf = (chain: PackageVersionChainDetails): BasicDeployment | null => {
  const version = chain.versions.findLast(it => !!it.deployment)
  return version?.deployment ?? null
}

const deployedAtOf = (chain: PackageVersionChainDetails): string => {
  const deployment = currentSuccessfulDeploymentOf(chain)
  const audit = deployment?.audit

  return audit?.updatedAt ?? audit?.createdAt ?? ''
}

type PackageEnvironmentVersionListProps = {
  environment: PackageEnvironmentDetails
}

const PackageEnvironmentVersionList = (props: PackageEnvironmentVersionListProps) => {
  const { environment } = props

  const { t } = useTranslation('packages')
  const routes = useTeamRoutes()

  const [chains, setChains] = useState<PackageVersionChainDetails[]>(environment.versionChains)
  const [targetChain, setTargetChain] = useState<PackageVersionChainDetails>(null)

  const onCreateDeployment = (chain: PackageVersionChainDetails) => setTargetChain(chain)

  const onDeploymentCreated = (deployment: Deployment) => {
    const newChains = [...chains]

    const chain = newChains.find(it => it.chainId === targetChain.chainId)

    const version = chain.versions.find(it => it.id === deployment.version.id)
    version.deployment = deployment

    setChains(newChains)
  }

  return (
    <>
      <DyoCard className="">
        <DyoTable data={chains} dataKey="chainId" initialSortColumn={0} initialSortDirection="asc">
          <DyoColumn
            header={t('common:project')}
            className="w-4/12"
            sortable
            sortField="project.name"
            sort={sortString}
            body={(it: PackageVersionChainDetails) => it.project.name}
          />

          <DyoColumn
            header={t('current')}
            className="w-2/12"
            sortable
            sortField={currentVersionNameOf}
            sort={sortString}
            body={currentVersionNameOf}
          />

          <DyoColumn
            header={t('latest')}
            className="w-2/12"
            sortable
            sortField={latestNameOf}
            sort={sortString}
            body={latestNameOf}
          />

          <DyoColumn
            header={t('deployed')}
            className="w-3/12"
            sortable
            sortField={deployedAtOf}
            sort={sortDate}
            suppressHydrationWarning
            body={(it: PackageVersionChainDetails) => {
              const deployedAt = deployedAtOf(it)

              return deployedAt ? utcDateToLocale(deployedAt) : t('common:never')
            }}
          />

          <DyoColumn
            header={t('common:actions')}
            className="w-1/12 text-center"
            body={(it: PackageVersionChainDetails) => {
              const deployment = lastestDeploymentOf(it)

              return (
                <div className="flex flex-row gap-2 items-center">
                  <DyoImgButton
                    src="/copy.svg"
                    width={24}
                    height={24}
                    alt={t('createDeployment')}
                    onClick={async () => await onCreateDeployment(it)}
                  />

                  {deployment && (
                    <DyoLink href={routes.deployment.details(deployment.id)} qaLabel="open-latest-deployment">
                      <DyoIcon src="/eye.svg" alt={t('common:deployment')} size="md" />
                    </DyoLink>
                  )}
                </div>
              )
            }}
          />
        </DyoTable>
      </DyoCard>

      {targetChain && (
        <CreatePackageDeploymentModal
          packageId={environment.package.id}
          environmentId={environment.id}
          chain={targetChain}
          onDeploymentCreated={onDeploymentCreated}
          onClose={() => setTargetChain(null)}
        />
      )}
    </>
  )
}

export default PackageEnvironmentVersionList
