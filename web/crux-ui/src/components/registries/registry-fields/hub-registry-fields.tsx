import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoPassword from '@app/elements/dyo-password'
import DyoToggle from '@app/elements/dyo-toggle'
import { HubRegistryDetails } from '@app/models'
import { EditRegistryTypeProps } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'

const HubRegistryFields = (props: EditRegistryTypeProps<HubRegistryDetails>) => {
  const { formik } = props

  const { t } = useTranslation('registries')

  return (
    <>
      <DyoLabel className="text-light mt-2">{t('tips.hub')}</DyoLabel>

      <DyoInput
        className="max-w-lg"
        grow
        name="imageNamePrefix"
        type="text"
        label={t('orgOrUser')}
        onChange={formik.handleChange}
        value={formik.values.imageNamePrefix}
        message={formik.errors.imageNamePrefix}
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
          } else {
            await formik.setFieldValue('user', formik.values.imageNamePrefix, false)
          }

          await formik.setFieldValue(field, value, shouldValidate)
        }}
      />

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

export default HubRegistryFields
