import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoToggle from '@app/elements/dyo-toggle'
import { UncheckedRegistryDetails } from '@app/models'
import { EditRegistryTypeProps } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'

const UncheckedRegistryFields = (props: EditRegistryTypeProps<UncheckedRegistryDetails>) => {
  const { formik } = props

  const { t } = useTranslation('registries')

  return (
    <>
      <DyoLabel className="text-light mt-2">{t('tips.unchecked')}</DyoLabel>

      <DyoToggle
        className="mt-8"
        name="local"
        label={t('useLocalImages')}
        checked={formik.values.local ?? false}
        setFieldValue={async (field, value, shouldValidate): Promise<void> => {
          if (!value) {
            await formik.setFieldValue('url', '', false)
          }

          await formik.setFieldValue(field, value, shouldValidate)
        }}
      />

      {!formik.values.local && (
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
      )}
    </>
  )
}

export default UncheckedRegistryFields
