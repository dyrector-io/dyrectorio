import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoPassword from '@app/elements/dyo-password'
import DyoToggle from '@app/elements/dyo-toggle'
import { EditableV2RegistryDetails } from '@app/models'
import { EditRegistryTypeProps, formikSetFieldValueOrIgnore } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'

const V2RegistryFields = (props: EditRegistryTypeProps<EditableV2RegistryDetails>) => {
  const { formik } = props
  const { values, errors, handleChange, setFieldValue } = formik

  const { t } = useTranslation('registries')

  const editing = !!values.id

  return (
    <>
      <DyoLabel className="text-light mt-2">{t('tips.v2')}</DyoLabel>

      <DyoInput
        className="max-w-lg"
        grow
        name="url"
        type="text"
        label={t('url')}
        onChange={handleChange}
        value={values.url}
        message={errors.url}
      />

      <DyoToggle
        className="mt-8"
        name="public"
        label={t('common:public')}
        checked={values.public}
        setFieldValue={async (field, value, shouldValidate) => {
          if (!value) {
            await setFieldValue('user', '', false)
            await setFieldValue('token', '', false)
          }

          await setFieldValue(field, value, shouldValidate)
        }}
      />

      {!values.public && (
        <>
          <DyoToggle
            className="mt-8"
            name="changeCredentials"
            label={t('common:changeCredentials')}
            checked={values.changeCredentials}
            setFieldValue={formikSetFieldValueOrIgnore(formik, !editing)}
          />

          {values.changeCredentials && (
            <>
              <DyoInput
                className="max-w-lg"
                grow
                name="user"
                type="text"
                label={t('user')}
                onChange={handleChange}
                value={values.user}
                message={errors.user}
              />

              <DyoPassword
                className="max-w-lg"
                grow
                name="token"
                label={t('token')}
                onChange={handleChange}
                value={values.token}
                message={errors.token}
              />
            </>
          )}
        </>
      )}
    </>
  )
}

export default V2RegistryFields
