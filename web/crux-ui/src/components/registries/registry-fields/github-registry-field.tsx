import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import { GithubRegistryDetails } from '@app/models'
import { EditRegistryTypeProps } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'

const GithubRegistryFields = (props: EditRegistryTypeProps<GithubRegistryDetails>) => {
  const { formik } = props

  const { t } = useTranslation('registries')

  return (
    <>
      <DyoLabel className="text-light mt-2">{t('tips.github')}</DyoLabel>

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
        label={t('pat')}
        onChange={formik.handleChange}
        value={formik.values.token}
        message={formik.errors.token}
      />

      <DyoInput
        className="max-w-lg"
        grow
        name="imageNamePrefix"
        label={t('organization')}
        onChange={formik.handleChange}
        value={formik.values.imageNamePrefix}
        message={formik.errors.imageNamePrefix}
      />
    </>
  )
}

export default GithubRegistryFields
