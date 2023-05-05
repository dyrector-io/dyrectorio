import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoForm from '@app/elements/dyo-form'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import { apiErrorHandler, defaultTranslator } from '@app/errors'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import { DyoErrorDto, InviteUser, TeamDetails, User } from '@app/models'
import { teamUserListApiUrl } from '@app/routes'
import { sendForm } from '@app/utils'
import { inviteUserSchema } from '@app/validations'
import useTranslation from 'next-translate/useTranslation'
import { MutableRefObject, useRef } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'

interface InviteUserCardProps {
  className?: string
  team: TeamDetails
  recaptchaSiteKey?: string
  onUserInvited: (product: User) => void
  submitRef?: MutableRefObject<() => Promise<any>>
}

const InviteUserCard = (props: InviteUserCardProps) => {
  const { team, className, onUserInvited, submitRef, recaptchaSiteKey } = props

  const { t } = useTranslation('teams')

  const handleApiError = apiErrorHandler((stringId: string, status: number, dto: DyoErrorDto) => {
    if (dto.property === 'captcha') {
      return {
        toast: dto.description,
      }
    }

    return defaultTranslator(t)(stringId, status, dto)
  })

  const recaptcha = useRef<ReCAPTCHA>()
  const formik = useDyoFormik({
    initialValues: {
      email: '',
      firstName: '',
      lastName: '',
    },
    validationSchema: inviteUserSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setSubmitting(true)

      const captcha = await recaptcha.current?.executeAsync()

      const request: InviteUser = {
        ...values,
        captcha,
      }

      const res = await sendForm('POST', teamUserListApiUrl(team.id), request)

      if (res.ok) {
        const json = await res.json()
        const user = json as User

        setSubmitting(false)
        onUserInvited(user)
      } else {
        recaptcha.current?.reset()

        setSubmitting(false)
        handleApiError(res, setFieldError)
      }
    },
  })

  if (submitRef) {
    submitRef.current = formik.submitForm
  }

  return (
    <DyoCard className={className}>
      <DyoHeading element="h4" className="text-lg text-bright">
        {t('inviteMember', { name: team.name })}
      </DyoHeading>

      <DyoLabel textColor="text-bright-muted">{t('tips')}</DyoLabel>

      <DyoForm className="flex flex-row gap-4" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
        <DyoInput
          containerClassName="w-2/4 max-w-lg"
          grow
          name="email"
          type="email"
          required
          label={t('common:email')}
          onChange={formik.handleChange}
          value={formik.values.email}
          message={formik.errors.email}
        />

        <DyoInput
          containerClassName="w-1/4"
          grow
          label={t('common:firstName')}
          name="firstName"
          onChange={formik.handleChange}
          value={formik.values.firstName}
          message={formik.errors.firstName}
          messageType="error"
        />

        <DyoInput
          containerClassName="w-1/4"
          grow
          label={t('common:lastName')}
          name="lastName"
          onChange={formik.handleChange}
          value={formik.values.lastName}
          message={formik.errors.lastName}
          messageType="error"
        />

        {recaptchaSiteKey ? <ReCAPTCHA ref={recaptcha} size="invisible" sitekey={recaptchaSiteKey} /> : null}

        <DyoButton className="hidden" type="submit" />
      </DyoForm>
    </DyoCard>
  )
}

export default InviteUserCard
