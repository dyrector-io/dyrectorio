import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoChips from '@app/elements/dyo-chips'
import DyoForm from '@app/elements/dyo-form'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import { defaultApiErrorHandler } from '@app/errors'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import { GeneratedToken, GenerateToken } from '@app/models'
import { API_TOKENS } from '@app/routes'
import { sendForm } from '@app/utils'
import { generateTokenSchema } from '@app/validations'
import useTranslation from 'next-translate/useTranslation'
import { MutableRefObject } from 'react'

const EXPIRATION_VALUES = [30, 60, 90, 0]

interface CreateTokenCardProps {
  className?: string
  submitRef?: MutableRefObject<() => Promise<any>>
  onTokenCreated: (token: GeneratedToken) => void
}

const CreateTokenCard = (props: CreateTokenCardProps) => {
  const { className, submitRef, onTokenCreated } = props

  const { t } = useTranslation('settings')

  const handleApiError = defaultApiErrorHandler(t)

  const formik = useDyoFormik({
    submitRef,
    validationSchema: generateTokenSchema,
    t,
    initialValues: {
      name: '',
      expirationInDays: EXPIRATION_VALUES[0],
    } as GenerateToken,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setSubmitting(true)

      const res = await sendForm('POST', API_TOKENS, values as GenerateToken)

      if (res.ok) {
        const json = await res.json()
        const result = json as GeneratedToken

        setSubmitting(false)
        onTokenCreated(result)
      } else {
        setSubmitting(false)
        handleApiError(res, setFieldError)
      }
    },
  })

  return (
    <DyoCard className={className}>
      <DyoHeading element="h4" className="text-lg text-bright">
        {t('tokens:newToken')}
      </DyoHeading>

      <DyoForm className="flex flex-col" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
        <DyoInput
          className="max-w-lg"
          grow
          name="name"
          type="name"
          required
          label={t('common:name')}
          onChange={formik.handleChange}
          value={formik.values.name}
          message={formik.errors.name}
        />

        <DyoLabel textColor="mt-8 mb-2.5 text-light-eased">{t('tokens:expirationIn')}</DyoLabel>
        <DyoChips
          className="text-bright"
          choices={EXPIRATION_VALUES}
          selection={formik.values.expirationInDays}
          converter={it => (it === 0 ? t('common:never') : t('common:days', { days: it }))}
          onSelectionChange={it => {
            formik.setFieldValue('expirationInDays', it, false)
          }}
        />

        <DyoButton className="hidden" type="submit" />
      </DyoForm>
    </DyoCard>
  )
}

export default CreateTokenCard
