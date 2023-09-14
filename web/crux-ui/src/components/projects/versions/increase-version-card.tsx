import useVersionHint from '@app/components/projects/versions/use-version-hint'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoForm from '@app/elements/dyo-form'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoTextArea from '@app/elements/dyo-text-area'
import { defaultApiErrorHandler } from '@app/errors'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import { SubmitHook } from '@app/hooks/use-submit'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { IncreaseVersion, Project, Version } from '@app/models'
import { sendForm } from '@app/utils'
import { increaseVersionSchema } from '@app/validations'
import useTranslation from 'next-translate/useTranslation'

interface IncreaseVersionCardProps {
  className?: string
  project: Project
  parent: Version
  onVersionIncreased: (version: Version) => void
  submit?: SubmitHook
}

const IncreaseVersionCard = (props: IncreaseVersionCardProps) => {
  const { className, parent, project, onVersionIncreased, submit } = props

  const { t } = useTranslation('versions')
  const routes = useTeamRoutes()

  const handleApiError = defaultApiErrorHandler(t)

  const [versionHint, setVersionHint] = useVersionHint(null)

  const formik = useDyoFormik({
    submit,
    initialValues: {
      name: '',
      changelog: '',
    },
    validationSchema: increaseVersionSchema,
    t,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setSubmitting(true)

      const body: IncreaseVersion = values

      const res = await sendForm('POST', routes.project.versions(project.id).api.increase(parent.id), body)

      if (res.ok) {
        const result = (await res.json()) as Version
        setSubmitting(false)
        onVersionIncreased(result)
      } else {
        setSubmitting(false)
        handleApiError(res, setFieldError)
      }
    },
  })

  return (
    <DyoCard className={className}>
      <DyoHeading element="h4" className="text-lg text-bright">
        {t('increaseName', { name: parent.name })}
      </DyoHeading>

      <DyoLabel className="text-light">{t('increaseTips')}</DyoLabel>

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

        <DyoButton className="hidden" type="submit" />
      </DyoForm>
    </DyoCard>
  )
}

export default IncreaseVersionCard
