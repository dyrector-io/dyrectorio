import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoForm from '@app/elements/dyo-form'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import { DyoConfirmationModal } from '@app/elements/dyo-modal'
import { defaultApiErrorHandler } from '@app/errors'
import useConfirmation from '@app/hooks/use-confirmation'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import { SubmitHook } from '@app/hooks/use-submit'
import { CreateTeam, DEFAULT_TEAM_STATISTICS, Team, teamSlugFromName, UpdateTeam } from '@app/models'
import { API_TEAMS, teamApiUrl } from '@app/routes'
import { sendForm } from '@app/utils'
import { createTeamSchema, updateTeamSchema } from '@app/validations'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'

interface EditTeamCardProps {
  className?: string
  team?: Team
  onTeamEdited: (team: Team) => void
  submit?: SubmitHook
}

const EditTeamCard = (props: EditTeamCardProps) => {
  const { className, team: propsTeam, onTeamEdited, submit } = props

  const { t } = useTranslation('teams')

  const [confirmationConfig, confirm] = useConfirmation()

  const [team, setTeam] = useState<Team>(
    propsTeam ?? {
      id: null,
      name: '',
      slug: '',
      statistics: DEFAULT_TEAM_STATISTICS,
    },
  )

  const editing = !!team.id

  const handleApiError = defaultApiErrorHandler(t)

  const formik = useDyoFormik({
    submit,
    initialValues: {
      name: team.name,
      slug: team.slug,
    },
    validationSchema: !editing ? createTeamSchema : updateTeamSchema,
    t,
    onSubmit: async (values, { setFieldError }) => {
      const body: CreateTeam | UpdateTeam = {
        ...values,
      }

      if (editing && propsTeam.slug !== body.slug) {
        const confirmed = await confirm({
          title: t('areYouSureChangeSlug', propsTeam),
          description: t('changingSlugHaveToAdjust'),
        })

        if (!confirmed) {
          return
        }
      }

      const res = await (!editing
        ? sendForm('POST', API_TEAMS, body as CreateTeam)
        : sendForm('PUT', teamApiUrl(team.id), body as UpdateTeam))

      if (res.ok) {
        let result: Team
        if (res.status !== 204) {
          const json = await res.json()
          result = json as Team
        } else {
          result = {
            ...team,
            name: values.name,
            slug: values.slug,
          } as Team
        }

        setTeam(result)
        onTeamEdited(result)
      } else {
        await handleApiError(res, setFieldError)
      }
    },
  })

  return (
    <DyoCard className={className}>
      <DyoHeading element="h4" className="text-lg text-bright">
        {editing ? t('common:editName', { name: team.name }) : t('createTeam')}
      </DyoHeading>

      <DyoLabel textColor="text-bright-muted">{t('tips')}</DyoLabel>

      <DyoForm className="flex flex-col" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
        <DyoInput
          className="max-w-lg"
          grow
          name="name"
          type="text"
          required
          label={t('common:name')}
          onChange={async e => {
            const { value } = e.target

            await formik.setFieldValue('slug', teamSlugFromName(value), false)
            formik.handleChange(e)
          }}
          value={formik.values.name}
          message={formik.errors.name}
        />

        <DyoInput
          className="max-w-lg"
          grow
          name="slug"
          type="text"
          required
          label={t('common:slug')}
          onChange={formik.handleChange}
          value={formik.values.slug}
          message={formik.errors.slug}
        />

        <DyoButton className="hidden" type="submit" />
      </DyoForm>

      <DyoConfirmationModal config={confirmationConfig} />
    </DyoCard>
  )
}

export default EditTeamCard
