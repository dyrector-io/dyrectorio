import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoPassword from '@app/elements/dyo-password'
import DyoToggle from '@app/elements/dyo-toggle'
import { V2RegistryDetails } from '@app/models'
import { EditRegistryTypeProps } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'

const V2RegistryFields = (props: EditRegistryTypeProps<V2RegistryDetails>) => {
  const { formik } = props

  const { t } = useTranslation('registries')

  return (
    <>
      <DyoLabel className="text-light mt-2">{t('tips.v2')}</DyoLabel>

      <DyoInput
        className="max-w-lg"
        grow
        name="url"
        type="text"
        label={t('url')}
        onChange={formik.handleChange}
        value={formik.values.url}
        message={formik.errors.url}
      />

      <DyoToggle
        className="mt-8"
        name="private"
        label={t('private')}
        checked={formik.values.private}
        setFieldValue={async (field, value, shouldValidate) => {
          if (!value) {
            await formik.setFieldValue('user', '', false)
            await formik.setFieldValue('token', '', false)
          }

          await formik.setFieldValue(field, value, shouldValidate)
        }}
      />

      <div className="flex mt-8">
        <DyoLabel className="mr-2">{}</DyoLabel>
      </div>

      {!formik.values.private ? null : (
        <>
          <DyoInput
            className="max-w-lg"
            grow
            name="user"
            type="text"
            label={t('user')}
            onChange={formik.handleChange}
            value={formik.values.user}
            message={formik.errors.user}
          />

          <DyoPassword
            className="max-w-lg"
            grow
            name="token"
            label={t('token')}
            onChange={formik.handleChange}
            value={formik.values.token}
            message={formik.errors.token}
          />
        </>
      )}
    </>
  )
}

export default V2RegistryFields
