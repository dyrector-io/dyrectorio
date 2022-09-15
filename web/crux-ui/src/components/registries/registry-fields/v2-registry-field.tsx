import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
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

      <div className="mr-auto">
        <DyoToggle
          className="text-bright mt-8"
          name="isPrivate"
          nameChecked={t('private')}
          nameUnchecked={t('public')}
          checked={formik.values.isPrivate}
          setFieldValue={(field: string, value: boolean, shouldValidate?: boolean | undefined) => {
            if (!value) {
              formik.setFieldValue('user', '', false)
              formik.setFieldValue('token', '', false)
            }
            return formik.setFieldValue(field, value, shouldValidate)
          }}
        />
      </div>

      {!formik.values.isPrivate ? null : (
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

          <DyoInput
            className="max-w-lg"
            grow
            name="token"
            type="password"
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
