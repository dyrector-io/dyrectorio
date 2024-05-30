import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoForm from '@app/elements/dyo-form'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import { defaultApiErrorHandler } from '@app/errors'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import { SubmitHook } from '@app/hooks/use-submit'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { CreatePackageEnvironment, DyoNode, PackageEnvironment, UpdatePackageEnvironment } from '@app/models'
import { sendForm } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'
import SelectNodeChips from '../nodes/select-node-chips'

type EditPackageEnvironmentCardProps = {
  className?: string
  packageId: string
  environment?: PackageEnvironment
  onEnvironmentEdited: (env: PackageEnvironment) => void
  submit?: SubmitHook
}

const EditPackageEnvironmentCard = (props: EditPackageEnvironmentCardProps) => {
  const { packageId, environment: propsEnv, className, onEnvironmentEdited, submit } = props

  const { t } = useTranslation('packages')
  const routes = useTeamRoutes()

  const [environment, setEnvironment] = useState<PackageEnvironment>(
    propsEnv ?? {
      id: null,
      name: '',
      node: null,
      prefix: '',
    },
  )

  const editing = !!environment.id

  const handleApiError = defaultApiErrorHandler(t)

  const formik = useDyoFormik({
    submit,
    initialValues: environment,
    // validationSchema: !editing ? createProjectSchema : updateProjectSchema,
    t,
    onSubmit: async (values, { setFieldError }) => {
      const body: CreatePackageEnvironment | UpdatePackageEnvironment = {
        name: values.name,
        nodeId: values.node?.id,
        prefix: values.prefix,
      }

      const res = await (!editing
        ? sendForm('POST', routes.package.api.environments(packageId), body as CreatePackageEnvironment)
        : sendForm(
            'PUT',
            routes.package.api.environmentDetails(packageId, environment.id),
            body as UpdatePackageEnvironment,
          ))

      if (!res.ok) {
        await handleApiError(res, setFieldError)
        return
      }

      let result: PackageEnvironment
      if (res.status !== 204) {
        const json = await res.json()
        result = json as PackageEnvironment
      } else {
        result = values
      }

      setEnvironment(result)
      onEnvironmentEdited(result)
    },
  })

  const onNodesFetched = (nodes: DyoNode[] | null) => {
    if (nodes?.length === 1) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      formik.setFieldValue('node', nodes[0])
    }
  }

  return (
    <DyoCard className={className}>
      <DyoHeading element="h4" className="text-lg text-bright">
        {editing ? t('common:editName', { name: environment.name }) : t('newEnvironment')}
      </DyoHeading>

      <DyoForm className="flex flex-col" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
        <DyoInput
          className="max-w-lg"
          grow
          name="name"
          type="text"
          label={t('common:name')}
          onChange={formik.handleChange}
          value={formik.values.name}
          message={formik.errors.name}
        />

        <DyoLabel className="mt-8">{t('common:node')}</DyoLabel>

        <SelectNodeChips
          name="nodes"
          selection={formik.values.node}
          onNodesFetched={onNodesFetched}
          onSelectionChange={async it => {
            await formik.setFieldValue('node', it)
          }}
        />

        <DyoInput
          className="max-w-lg"
          grow
          name="prefix"
          type="text"
          label={t('common:prefix')}
          onChange={formik.handleChange}
          value={formik.values.name}
          message={formik.errors.name}
        />

        <DyoButton className="hidden" type="submit" />
      </DyoForm>
    </DyoCard>
  )
}

export default EditPackageEnvironmentCard
