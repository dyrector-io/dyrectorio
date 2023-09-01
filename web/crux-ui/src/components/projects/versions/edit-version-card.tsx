import useVersionHint from '@app/components/projects/versions/use-version-hint'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoChips from '@app/elements/dyo-chips'
import DyoForm from '@app/elements/dyo-form'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoTextArea from '@app/elements/dyo-text-area'
import { defaultApiErrorHandler } from '@app/errors'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { CreateVersion, EditableVersion, Project, UpdateVersion, VERSION_TYPE_VALUES } from '@app/models'
import { sendForm } from '@app/utils'
import { createVersionSchema, updateVersionSchema } from '@app/validations'
import useTranslation from 'next-translate/useTranslation'
import { MutableRefObject, useEffect, useState } from 'react'

interface EditVersionCardProps {
  className?: string
  project: Project
  version?: EditableVersion
  onVersionEdited: (version: EditableVersion) => void
  submitRef?: MutableRefObject<() => Promise<any>>
}

const EditVersionCard = (props: EditVersionCardProps) => {
  const { t } = useTranslation('versions')
  const routes = useTeamRoutes()

  const { project, className, version: propsVersion, onVersionEdited, submitRef } = props

  const [version, setVersion] = useState<EditableVersion>(
    propsVersion ?? {
      id: null,
      name: '',
      changelog: '',
      type: 'incremental',
      increasable: true,
      audit: null,
    },
  )

  const editing = !!version.id

  const handleApiError = defaultApiErrorHandler(t)

  const [versionHint, setVersionHint] = useVersionHint(version.name)

  const formik = useDyoFormik(
    {
      initialValues: {
        ...version,
      },
      validationSchema: !editing ? createVersionSchema : updateVersionSchema,
      onSubmit: async (values, { setSubmitting, setFieldError }) => {
        setSubmitting(true)

        const body: CreateVersion | UpdateVersion = values

        const res = await (!editing
          ? sendForm('POST', routes.project.versions(project.id).api.list(), body as CreateVersion)
          : sendForm('PUT', routes.project.versions(project.id).api.details(version.id), body as UpdateVersion))

        if (res.ok) {
          let result: EditableVersion
          if (res.status !== 204) {
            const json = await res.json()
            result = json as EditableVersion
          } else {
            result = {
              ...values,
            } as EditableVersion
          }

          setVersion(result)
          setSubmitting(false)
          onVersionEdited(result)
        } else {
          setSubmitting(false)
          handleApiError(res, setFieldError)
        }
      },
    },
    submitRef,
  )

  return (
    <DyoCard className={className}>
      <DyoHeading element="h4" className="text-lg text-bright">
        {editing ? t('common:editName', { name: version.name }) : t('new')}
      </DyoHeading>

      <DyoLabel className="text-light">{t('tips')}</DyoLabel>

      <DyoForm className="flex flex-col" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
        <DyoInput
          className="max-w-lg"
          grow
          name="name"
          type="name"
          required
          label={t('common:name')}
          onChange={e => {
            formik.handleChange(e)
            setVersionHint(e.target.value)
          }}
          value={formik.values.name}
          message={versionHint ?? formik.errors.name}
          messageType={versionHint ? 'info' : 'error'}
        />

        <DyoTextArea
          className="h-48"
          grow
          name="changelog"
          label={t('changelog')}
          onChange={formik.handleChange}
          value={formik.values.changelog}
          message={formik.errors.changelog}
        />

        {editing ? null : (
          <>
            <DyoLabel textColor="mt-8 mb-2.5 text-light-eased">{t('type')}</DyoLabel>

            <DyoChips
              className="text-bright"
              choices={VERSION_TYPE_VALUES}
              selection={formik.values.type}
              converter={it => t(it)}
              onSelectionChange={type => {
                formik.setFieldValue('type', type, false)
              }}
            />
          </>
        )}

        <DyoButton className="hidden" type="submit" />
      </DyoForm>
    </DyoCard>
  )
}

export default EditVersionCard
