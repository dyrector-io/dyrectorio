import DyoChips, { chipsQALabelFromValue } from '@app/elements/dyo-chips'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoLink from '@app/elements/dyo-link'
import DyoPassword from '@app/elements/dyo-password'
import DyoToggle from '@app/elements/dyo-toggle'
import { EditableGithubRegistryDetails, GITHUB_NAMESPACE_VALUES, RegistryNamespace } from '@app/models'
import { EditRegistryTypeProps, formikSetFieldValueOrIgnore } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'

const GithubRegistryFields = (props: EditRegistryTypeProps<EditableGithubRegistryDetails>) => {
  const { formik } = props
  const { values, errors, handleChange, setFieldValue } = formik

  const { t } = useTranslation('registries')

  const editing = !!values.id

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

      <div className="flex flex-wrap mt-8">
        <DyoLabel className="mr-2 my-auto">{t('namespaceType')}</DyoLabel>

        <DyoChips
          name="githubNamespaceType"
          choices={GITHUB_NAMESPACE_VALUES}
          selection={values.namespace}
          converter={(it: RegistryNamespace) => t(`namespace.${it}`)}
          onSelectionChange={it => setFieldValue('namespace', it, true)}
          qaLabel={chipsQALabelFromValue}
        />
      </div>

      <DyoInput
        className="max-w-lg"
        labelClassName="mt-8 mb-2.5"
        grow
        name="imageNamePrefix"
        label={values.namespace === 'organization' ? t('organization') : t('userName')}
        onChange={handleChange}
        value={values.imageNamePrefix}
        message={errors.imageNamePrefix}
      />

      {editing && (
        <DyoToggle
          className="mt-8"
          disabled={!editing}
          name="changeCredentials"
          label={t('common:changeCredentials')}
          checked={values.changeCredentials}
          setFieldValue={formikSetFieldValueOrIgnore(formik, !editing)}
        />
      )}

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
            label={t('pat')}
            onChange={handleChange}
            value={values.token}
            message={errors.token}
          />
        </>
      )}
    </>
  )
}

export default GithubRegistryFields
