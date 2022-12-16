import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
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
        disabled={formik.values.inUse}
        onChange={formik.handleChange}
        value={formik.values.imageNamePrefix}
        message={formik.errors.imageNamePrefix}
      />
    </>
  )
}

export default HubRegistryFields
