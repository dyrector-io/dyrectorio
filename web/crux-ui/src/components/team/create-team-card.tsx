import { DyoButton } from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import { defaultApiErrorHandler } from '@app/errors'
import { CreateTeam, ActiveTeamDetails } from '@app/models'
import { API_TEAMS } from '@app/routes'
import { sendForm } from '@app/utils'
import { createTeamSchema } from '@app/validation'
import { useFormik } from 'formik'
import useTranslation from 'next-translate/useTranslation'

interface CreateTeamCardProps {
  className?: string
  onTeamCreated: (team: ActiveTeamDetails) => void
}

const CreateTeamCard = (props: CreateTeamCardProps) => {
  const { t } = useTranslation('teams')

  const handleApiError = defaultApiErrorHandler(t)

  const formik = useFormik({
    validationSchema: createTeamSchema,
    initialValues: {
      name: '',
    },
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setSubmitting(true)

      const res = await sendForm('POST', API_TEAMS, values as CreateTeam)

      if (res.ok) {
        const json = await res.json()
        const team = json as ActiveTeamDetails

        props.onTeamCreated(team)
      } else {
        handleApiError(res, setFieldError)
      }

      setSubmitting(false)
    },
  })

  return (
    <DyoCard className={props.className}>
      <DyoHeading element="h4" className="text-lg text-bright">
        {t('createTeam')}
      </DyoHeading>

      <DyoLabel className="text-light">{t('tips')}</DyoLabel>

      <form className="flex flex-col" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
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
      </form>
    </DyoCard>
  )
}

export default CreateTeamCard
