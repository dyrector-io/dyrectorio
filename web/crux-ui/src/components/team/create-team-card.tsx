import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoForm from '@app/elements/dyo-form'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import { defaultApiErrorHandler } from '@app/errors'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import { ActiveTeamDetails, CreateTeam } from '@app/models'
import { API_TEAMS } from '@app/routes'
import { sendForm } from '@app/utils'
import { createTeamSchema } from '@app/validations'
import useTranslation from 'next-translate/useTranslation'

interface CreateTeamCardProps {
  className?: string
  onTeamCreated: (team: ActiveTeamDetails) => void
}

const CreateTeamCard = (props: CreateTeamCardProps) => {
  const { className, onTeamCreated } = props

  const { t } = useTranslation('teams')

  const handleApiError = defaultApiErrorHandler(t)

  const formik = useDyoFormik({
    initialValues: {
      name: '',
    },
    validationSchema: createTeamSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setSubmitting(true)

      const res = await sendForm('POST', API_TEAMS, values as CreateTeam)

      if (res.ok) {
        const json = await res.json()
        const team = json as ActiveTeamDetails

        setSubmitting(false)
        onTeamCreated(team)
      } else {
        setSubmitting(false)
        handleApiError(res, setFieldError)
      }
    },
  })

  return (
    <DyoCard className={className}>
      <DyoHeading element="h4" className="text-lg text-bright">
        {t('createTeam')}
      </DyoHeading>

      <DyoLabel textColor="text-bright-muted">{t('tips')}</DyoLabel>

      <DyoForm className="flex flex-col" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
        <DyoInput
          className="min-w-lg"
          grow
          name="name"
          type="name"
          required
          label={t('common:name')}
          onChange={formik.handleChange}
          value={formik.values.name}
          message={formik.errors.name}
        />

        <DyoButton className="mt-8" type="submit">
          {t('common:create')}
        </DyoButton>
      </DyoForm>
    </DyoCard>
  )
}

export default CreateTeamCard
