import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import { UncheckedRegistryDetails } from '@app/models'
import { EditRegistryTypeProps } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'

const UncheckedRegistryFields = (props: EditRegistryTypeProps<UncheckedRegistryDetails>) => {
  const { formik } = props

  const { t } = useTranslation('registries')

  return (
    <>
      <DyoLabel className="text-light mt-2">{t('tips.unchecked')}</DyoLabel>

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
    </>
  )
}

export default UncheckedRegistryFields
