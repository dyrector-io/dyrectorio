import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoSwitch from '@app/elements/dyo-switch'
import { UncheckedRegistryDetails } from '@app/models'
import { EditRegistryTypeProps } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'

const UncheckedRegistryFields = (props: EditRegistryTypeProps<UncheckedRegistryDetails>) => {
  const { formik } = props

  const { t } = useTranslation('registries')

  return (
    <>
      <DyoLabel className="text-light mt-2">{t('tips.unchecked')}</DyoLabel>

      <div className="flex mt-8">
        <DyoLabel className="mr-2">{t('useLocalImages')}</DyoLabel>

        <DyoSwitch
          fieldName="local"
          checked={formik.values.local ?? false}
          setFieldValue={(field: string, value: boolean, shouldValidate?: boolean | undefined) => {
            if (!value) {
              formik.setFieldValue('url', '', false)
            }
            return formik.setFieldValue(field, value, shouldValidate)
          }}
        />
      </div>

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
