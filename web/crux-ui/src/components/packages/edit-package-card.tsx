import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoForm from '@app/elements/dyo-form'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoIconPicker from '@app/elements/dyo-icon-picker'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoTextArea from '@app/elements/dyo-text-area'
import { defaultApiErrorHandler } from '@app/errors'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import { SubmitHook } from '@app/hooks/use-submit'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { CreatePackage, PackageDetails, PackageVersionChain, UpdatePackage } from '@app/models'
import { sendForm } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'
import AddVersionChains from './add-version-chains'
import VersionChainList from './version-chain-list'

type EditPackageCardProps = {
  className?: string
  package?: PackageDetails
  onPackageEdited: (registry: PackageDetails) => void
  submit: SubmitHook
}

const EditPackageCard = (props: EditPackageCardProps) => {
  const { className, package: propsPackage, onPackageEdited, submit } = props

  const { t } = useTranslation('packages')
  const routes = useTeamRoutes()

  const [pack, setPackage] = useState<PackageDetails>(
    propsPackage ?? {
      id: null,
      name: '',
      description: '',
      icon: null,
      environments: [],
      versionChains: [],
    },
  )

  const [addingVersionChains, setAddingVersionChains] = useState(false)

  const onVersionChainsAdded = (chains: PackageVersionChain[]) => {
    setPackage({
      ...pack,
      versionChains: [...pack.versionChains, ...chains],
    })

    setAddingVersionChains(false)
  }

  const onRemoveVersionChain = (chain: PackageVersionChain) => {
    setPackage({
      ...pack,
      versionChains: pack.versionChains.filter(it => it.id !== chain.id),
    })
  }

  const editing = !!pack.id

  const handleApiError = defaultApiErrorHandler(t)

  const formik = useDyoFormik<PackageDetails>({
    submit,
    initialValues: pack,
    // validationSchema: packageSchema,
    t,
    onSubmit: async values => {
      const body: CreatePackage | UpdatePackage = {
        name: values.name,
        description: values.description,
        icon: values.icon,
        chainIds: values.versionChains.map(it => it.id),
      }

      const res = await (!editing
        ? sendForm('POST', routes.package.api.list(), body)
        : sendForm('PUT', routes.package.api.details(pack.id), body))

      if (!res.ok) {
        await handleApiError(res)
        return
      }

      let result = values
      if (res.status !== 204) {
        result = (await res.json()) as PackageDetails
      }

      setPackage(result)
      onPackageEdited(result)
    },
  })

  return (
    <DyoCard className={className}>
      <DyoHeading element="h4" className="text-lg text-bright">
        {editing ? t('common:editName', { name: pack.name }) : t('new')}
      </DyoHeading>

      <DyoLabel className="text-light block">{t('tips')}</DyoLabel>

      <DyoForm className="grid grid-cols-2 gap-8" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
        <div className="flex flex-col">
          <div className="flex flex-col mt-4">
            <DyoInput
              className="max-w-lg"
              grow
              name="name"
              type="name"
              label={t('common:name')}
              labelClassName="mr-2 mb-1 text-light-eased"
              onChange={formik.handleChange}
              value={formik.values.name}
              message={formik.errors.name}
            />
          </div>

          <div className="w-full mt-2">
            <DyoLabel>{t('common:icon')}</DyoLabel>

            <DyoIconPicker name="icon" value={formik.values.icon} setFieldValue={formik.setFieldValue} />
          </div>

          <DyoTextArea
            className="h-48"
            grow
            name="description"
            label={t('common:description')}
            onChange={formik.handleChange}
            value={formik.values.description}
          />
        </div>

        {addingVersionChains ? (
          <AddVersionChains
            className="mt-4"
            currentChains={pack.versionChains}
            onAdd={onVersionChainsAdded}
            onDiscard={() => setAddingVersionChains(false)}
          />
        ) : (
          <div className="flex flex-col">
            <DyoLabel className="mt-4 mb-2.5">{t('versionChains')}</DyoLabel>

            <DyoButton className="self-end px-6" onClick={() => setAddingVersionChains(true)}>
              {t('common:add')}
            </DyoButton>

            {pack.versionChains.length > 0 ? (
              <VersionChainList className="mt-4" versionChains={pack.versionChains} onRemove={onRemoveVersionChain} />
            ) : (
              <p className="text-light my-2">{t('noVersionChains')}</p>
            )}
          </div>
        )}

        <DyoButton className="hidden" type="submit" />
      </DyoForm>
    </DyoCard>
  )
}

export default EditPackageCard
