import DyoButton from '@app/elements/dyo-button'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import DyoModal from '@app/elements/dyo-modal'
import DyoRadioButton from '@app/elements/dyo-radio-button'
import { defaultApiErrorHandler } from '@app/errors'
import { TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import useTeamRoutes from '@app/hooks/use-team-routes'
import {
  CreatePackageDeployment,
  Deployment,
  DyoApiError,
  PackageVersion,
  PackageVersionChainDetails,
} from '@app/models'
import { sendForm, toastWarning } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { QA_MODAL_LABEL_CREATE_PACKAGE_DEPLOYMENT } from 'quality-assurance'
import { useState } from 'react'

type CreatePackageDeploymentModalProps = {
  className?: string
  packageId: string
  environmentId: string
  chain: PackageVersionChainDetails
  onDeploymentCreated: (deployment: Deployment) => void
  onClose: VoidFunction
}

const CreatePackageDeploymentModal = (props: CreatePackageDeploymentModalProps) => {
  const { className, packageId, environmentId, chain, onDeploymentCreated, onClose } = props

  const { t } = useTranslation('packages')

  const router = useRouter()
  const routes = useTeamRoutes()

  const [selected, setSelected] = useState(chain.versions.at(-1) ?? null)

  const filters = useFilters<PackageVersion, TextFilter>({
    filters: [textFilterFor<PackageVersion>(it => [it.name])],
    data: chain?.versions ?? [],
    initialFilter: {
      text: '',
    },
  })

  const handleApiError = defaultApiErrorHandler(t)

  const onCreate = async () => {
    if (!selected) {
      return
    }

    const body: CreatePackageDeployment = {
      versionId: selected.id,
    }

    const res = await sendForm('POST', routes.package.api.environmentDeployments(packageId, environmentId), body)

    if (!res.ok) {
      if (res.status === 409) {
        // A deployment with the prefix on that node is already exists

        const error = (await res.json()) as DyoApiError

        toastWarning(t('deployments:alreadyHaveDeployment'))
        await router.push(routes.deployment.details(error.value))
        return
      }

      await handleApiError(res)
      return
    }

    const deployment = (await res.json()) as Deployment
    onDeploymentCreated(deployment)

    onClose()
  }

  return (
    <DyoModal
      className={className}
      titleClassName="pl-4 font-medium text-xl text-bright mb-3"
      title={t('createDeployment')}
      open
      onClose={onClose}
      qaLabel={QA_MODAL_LABEL_CREATE_PACKAGE_DEPLOYMENT}
      buttons={
        <>
          <DyoButton disabled={!selected} onClick={onCreate}>
            {t('common:create')}
          </DyoButton>

          <DyoButton secondary onClick={onClose}>
            {t('common:cancel')}
          </DyoButton>
        </>
      }
    >
      <div className="flex flex-col">
        <DyoInput
          className="w-2/3 mt-6 mb-8"
          placeholder={t('common:search')}
          onChange={e =>
            filters.setFilter({
              text: e.target.value,
            })
          }
        />

        <DyoHeading element="h5" className="text-lg text-bright font-bold">
          {t('common:versions')}
        </DyoHeading>

        <div className="overflow-y-auto max-h-96">
          {filters.filtered.map((it, index) => (
            <DyoRadioButton
              key={`version-${it}`}
              label={it.name}
              checked={it === selected}
              onSelect={() => {
                setSelected(it)
              }}
              qaLabel={`version-${index}`}
            />
          ))}
        </div>
      </div>
    </DyoModal>
  )
}

export default CreatePackageDeploymentModal
