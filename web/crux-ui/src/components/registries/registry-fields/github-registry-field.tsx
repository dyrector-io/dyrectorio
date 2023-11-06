import DyoChips, { chipsQALabelFromValue } from '@app/elements/dyo-chips'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoLink from '@app/elements/dyo-link'
import { GITHUB_NAMESPACE_VALUES, GithubRegistryDetails, RegistryNamespace } from '@app/models'
import { EditRegistryTypeProps } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'

const GithubRegistryFields = (props: EditRegistryTypeProps<GithubRegistryDetails>) => {
  const { formik } = props

  const { t } = useTranslation('registries')

  return (
    <>
      <DyoLabel className="text-light mt-2">
        {t('tips.githubTokenReason')}
        <span className="ml-1">{t('tips.learnMorePat')}</span>
        <DyoLink
          className="text-blue-300 ml-1"
          href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens"
          target="_blank"
          qaLabel="github-token-reason-learn-more"
        >
          {t('here')}
        </DyoLink>
        .
      </DyoLabel>

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

      <div className="flex flex-wrap mt-8">
        <DyoLabel className="mr-2 my-auto">{t('namespaceType')}</DyoLabel>

        <DyoChips
          name="githubNamespaceType"
          choices={GITHUB_NAMESPACE_VALUES}
          selection={formik.values.namespace}
          converter={(it: RegistryNamespace) => t(`namespace.${it}`)}
          onSelectionChange={it => formik.setFieldValue('namespace', it, true)}
          qaLabel={chipsQALabelFromValue}
        />
      </div>

      <DyoInput
        className="max-w-lg"
        labelClassName="mt-8 mb-2.5"
        grow
        name="imageNamePrefix"
        label={formik.values.namespace === 'organization' ? t('organization') : t('userName')}
        onChange={formik.handleChange}
        value={formik.values.imageNamePrefix}
        message={formik.errors.imageNamePrefix}
      />
    </>
  )
}

export default GithubRegistryFields
