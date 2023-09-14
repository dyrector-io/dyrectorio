import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoForm from '@app/elements/dyo-form'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import DyoTextArea from '@app/elements/dyo-text-area'
import DyoToggle from '@app/elements/dyo-toggle'
import { defaultApiErrorHandler } from '@app/errors'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import { SubmitHook } from '@app/hooks/use-submit'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { Project, ProjectType, CreateProjectFromTemplate, Template } from '@app/models'
import { API_TEMPLATES, ROUTE_INDEX } from '@app/routes'
import { sendForm } from '@app/utils'
import { applyTemplateSchema } from '@app/validations'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'

interface ApplyTemplateCardProps {
  className?: string
  template: Template
  onTemplateApplied: (projectId: string) => Promise<void>
  submit?: SubmitHook
}

const ApplyTemplateCard = (props: ApplyTemplateCardProps) => {
  const { template: propsTemplate, className, onTemplateApplied, submit } = props

  const { t } = useTranslation('templates')
  const routes = useTeamRoutes()
  const router = useRouter()

  if (!routes) {
    router.push(ROUTE_INDEX)
  }

  const handleApiError = defaultApiErrorHandler(t)

  const formik = useDyoFormik({
    submit,
    initialValues: {
      name: propsTemplate.name,
      description: propsTemplate.description,
      type: 'versionless' as ProjectType,
    },
    validationSchema: applyTemplateSchema,
    t,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setSubmitting(true)

      const body: CreateProjectFromTemplate = {
        id: propsTemplate.id,
        ...values,
        teamSlug: routes?.teamSlug,
      }

      const res = await sendForm('POST', API_TEMPLATES, body)

      if (res.ok) {
        const json = await res.json()
        const result = json as Project

        setSubmitting(false)
        await onTemplateApplied(result.id)
      } else {
        setSubmitting(false)
        handleApiError(res, setFieldError)
      }
    },
  })

  return (
    <DyoCard className={className}>
      <DyoHeading element="h4" className="text-lg text-bright">
        {t('applyTemplate', { name: propsTemplate.name })}
      </DyoHeading>
      <DyoForm className="flex flex-col" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
        <DyoInput
          className="max-w-lg"
          grow
          name="name"
          type="name"
          required
          label={t('projectName')}
          onChange={formik.handleChange}
          value={formik.values.name}
          message={formik.errors.name}
        />

        <DyoTextArea
          className="h-48"
          grow
          name="description"
          label={t('description')}
          onChange={formik.handleChange}
          value={formik.values.description}
        />

        <DyoToggle
          className="justify-self-start mt-8"
          name="type"
          label={t('projects:versioning')}
          checked={formik.values.type === 'versioned'}
          onCheckedChange={it => formik.setFieldValue('type', it ? 'versioned' : 'versionless')}
        />

        <DyoButton className="hidden" type="submit" />
      </DyoForm>
    </DyoCard>
  )
}

export default ApplyTemplateCard
