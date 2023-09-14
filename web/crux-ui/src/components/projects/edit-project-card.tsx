import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoForm from '@app/elements/dyo-form'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoTextArea from '@app/elements/dyo-text-area'
import DyoToggle from '@app/elements/dyo-toggle'
import { defaultApiErrorHandler } from '@app/errors'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { CreateProject, EditableProject, Project, UpdateProject } from '@app/models'
import { sendForm } from '@app/utils'
import { createProjectSchema, updateProjectSchema } from '@app/validations'
import useTranslation from 'next-translate/useTranslation'
import { MutableRefObject, useState } from 'react'

interface EditProjectCardProps {
  className?: string
  project?: EditableProject
  onProjectEdited: (project: Project) => void
  submitRef?: MutableRefObject<() => Promise<any>>
}

const EditProjectCard = (props: EditProjectCardProps) => {
  const { project: propsProject, className, onProjectEdited, submitRef } = props

  const { t } = useTranslation('projects')
  const routes = useTeamRoutes()

  const [project, setProject] = useState<EditableProject>(
    propsProject ?? {
      id: null,
      name: '',
      description: '',
      audit: null,
      type: 'versioned',
      changelog: '',
    },
  )

  const editing = !!project.id

  const changelogVisible = editing && project.type === 'versionless'

  const handleApiError = defaultApiErrorHandler(t)

  const formik = useDyoFormik({
    submitRef,
    initialValues: {
      ...project,
    },
    validationSchema: !editing ? createProjectSchema : updateProjectSchema,
    t,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setSubmitting(true)

      const body: CreateProject | UpdateProject = {
        ...values,
      }

      const res = await (!editing
        ? sendForm('POST', routes.project.api.list(), body as CreateProject)
        : sendForm('PUT', routes.project.api.details(project.id), body as UpdateProject))

      if (res.ok) {
        let result: Project
        if (res.status !== 204) {
          const json = await res.json()
          result = json as Project
        } else {
          result = {
            ...values,
          } as Project
        }

        setProject(result)
        setSubmitting(false)
        onProjectEdited(result)
      } else {
        setSubmitting(false)
        handleApiError(res, setFieldError)
      }
    },
  })

  return (
    <DyoCard className={className}>
      <DyoHeading element="h4" className="text-lg text-bright">
        {editing ? t('common:editName', { name: project.name }) : t('new')}
      </DyoHeading>

      <DyoLabel textColor="text-bright-muted">{t('tips')}</DyoLabel>

      <DyoForm className="flex flex-col" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
        <DyoInput
          className="max-w-lg"
          grow
          name="name"
          type="name"
          required
          label={t('name')}
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

        {editing ? null : (
          <DyoToggle
            className="justify-self-start mt-8"
            name="type"
            label={t('versioning')}
            checked={formik.values.type === 'versioned'}
            onCheckedChange={it => formik.setFieldValue('type', it ? 'versioned' : 'versionless')}
          />
        )}

        {!changelogVisible ? null : (
          <DyoTextArea
            className="h-48"
            grow
            name="changelog"
            label={t('changelog')}
            onChange={formik.handleChange}
            value={formik.values.changelog}
          />
        )}

        <DyoButton className="hidden" type="submit" />
      </DyoForm>
    </DyoCard>
  )
}

export default EditProjectCard
