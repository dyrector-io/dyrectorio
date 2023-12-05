import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoPassword from '@app/elements/dyo-password'
import DyoToggle from '@app/elements/dyo-toggle'
import { EditableHubRegistryDetails } from '@app/models'
import { EditRegistryTypeProps, formikSetFieldValueOrIgnore } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'

const HubRegistryFields = (props: EditRegistryTypeProps<EditableHubRegistryDetails>) => {
  const { formik } = props
  const { values, errors, handleChange, setFieldValue } = formik

  const { t } = useTranslation('registries')

  const editing = !!values.id

  return (
    <>
      <DyoLabel className="text-light mt-2">{t('tips.hub')}</DyoLabel>

      <DyoInput
        className="max-w-lg"
        grow
        name="imageNamePrefix"
        type="text"
        label={t('orgOrUser')}
        onChange={handleChange}
        value={values.imageNamePrefix}
        message={errors.imageNamePrefix}
      />

      <DyoToggle
        className="mt-8"
        name="public"
        label={t('common:public')}
        checked={values.public}
        setFieldValue={async (field, value, shouldValidate) => {
          if (value) {
            await setFieldValue('changeCredentials', false, false)
            await setFieldValue('user', '', false)
          } else {
            await setFieldValue('changeCredentials', true, false)
            await setFieldValue('user', values.imageNamePrefix, false)
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

export default HubRegistryFields
