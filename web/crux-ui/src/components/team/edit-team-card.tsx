import { DyoButton } from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import { defaultApiErrorHandler } from '@app/errors'
import { CreateTeam, DEFAULT_TEAM_STATISTICS, Team, UpdateTeam } from '@app/models'
import { API_TEAMS, teamApiUrl } from '@app/routes'
import { sendForm } from '@app/utils'
import { createProductSchema, updateProductSchema } from '@app/validation'
import { useFormik } from 'formik'
import useTranslation from 'next-translate/useTranslation'
import { MutableRefObject, useState } from 'react'

interface EditTeamCardProps {
  className?: string
  team?: Team
  onTeamEdited: (team: Team) => void
  submitRef?: MutableRefObject<() => Promise<any>>
}

const EditTeamCard = (props: EditTeamCardProps) => {
  const { t } = useTranslation('teams')

  const [team, setTeam] = useState<Team>(
    props.team ?? {
      id: null,
      name: '',
      statistics: DEFAULT_TEAM_STATISTICS,
    },
  )

  const editing = !!team.id

  const handleApiError = defaultApiErrorHandler(t)

  const formik = useFormik({
    validationSchema: !editing ? createProductSchema : updateProductSchema,
    initialValues: {
      name: team.name,
    },
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setSubmitting(true)

      const body: CreateTeam | UpdateTeam = {
        ...values,
      }

      const res = await (!editing
        ? sendForm('POST', API_TEAMS, body as CreateTeam)
        : sendForm('PUT', teamApiUrl(team.id), body as UpdateTeam))

      if (res.ok) {
        let result: Team
        if (res.status != 204) {
          const json = await res.json()
          result = json as Team
        } else {
          result = {
            ...team,
            name: values.name,
          } as Team
        }

        setTeam(result)
        props.onTeamEdited(result)
      } else {
        handleApiError(res, setFieldError)
      }

      setSubmitting(false)
    },
  })

  if (props.submitRef) {
    props.submitRef.current = formik.submitForm
  }

  return (
    <>
      <DyoCard className={props.className}>
        <DyoHeading element="h4" className="text-lg text-bright">
          {editing ? t('common:editName', { name: team.name }) : t('createTeam')}
        </DyoHeading>

        <DyoLabel className="text-light">{t('tips')}</DyoLabel>

        <form className="flex flex-col" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
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

          <DyoButton className="hidden" type="submit"></DyoButton>
        </form>
      </DyoCard>
    </>
  )
}

export default EditTeamCard
