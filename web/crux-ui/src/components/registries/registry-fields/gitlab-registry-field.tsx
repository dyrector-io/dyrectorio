import DyoChips, { chipsQALabelFromValue } from '@app/elements/dyo-chips'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoLink from '@app/elements/dyo-link'
import DyoPassword from '@app/elements/dyo-password'
import DyoToggle from '@app/elements/dyo-toggle'
import { EditableGitlabRegistryDetails, GITLAB_NAMESPACE_VALUES, RegistryNamespace } from '@app/models'
import { EditRegistryTypeProps, formikSetFieldValueOrIgnore } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'

const GitlabRegistryFields = (props: EditRegistryTypeProps<EditableGitlabRegistryDetails>) => {
  const { formik } = props
  const { values, errors, handleChange, setFieldValue } = formik

  const { t } = useTranslation('registries')

  const editing = !!values.id

  return (
    <>
      <DyoLabel className="mt-2">
        {t('tips.gitlab')}
        <span className="ml-1">{t('tips.learnMorePat')}</span>
        <DyoLink
          className="ml-1 text-blue-300"
          href="https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html"
          target="_blank"
          qaLabel="gitlab-token-reason-learn-more"
        >
          {t('here')}
        </DyoLink>
        .
      </DyoLabel>

      <div className="flex flex-wrap mt-8">
        <DyoLabel className="mr-2 my-auto">{t('namespaceType')}</DyoLabel>

        <DyoChips
          name="gitlabNamespaceType"
          choices={GITLAB_NAMESPACE_VALUES}
          selection={values.namespace}
          converter={(it: RegistryNamespace) => t(`namespace.${it}`)}
          onSelectionChange={it => setFieldValue('namespace', it, true)}
          qaLabel={chipsQALabelFromValue}
        />
      </div>

      <DyoInput
        className="max-w-lg"
        grow
        name="imageNamePrefix"
        type="text"
        label={values.namespace === 'group' ? t('group') : t('project')}
        onChange={handleChange}
        value={values.imageNamePrefix}
        message={errors.imageNamePrefix}
      />

      <DyoToggle
        className="mt-8"
        name="selfManaged"
        label={t('selfManaged')}
        checked={values.selfManaged}
        setFieldValue={async (field, value, shouldValidate): Promise<void> => {
          if (!value) {
            await setFieldValue('url', '', false)
            await setFieldValue('apiUrl', '', false)
          }

          await setFieldValue(field, value, shouldValidate)
        }}
      />

      {!values.selfManaged ? null : (
        <>
          <DyoInput
            className="max-w-lg"
            grow
            name="url"
            type="text"
            label={t('url')}
            onChange={handleChange}
            value={values.url}
            message={errors.url}
          />

          <DyoInput
            className="max-w-lg"
            grow
            name="apiUrl"
            type="text"
            label={t('apiUrl')}
            onChange={handleChange}
            value={values.apiUrl}
            message={errors.apiUrl}
          />
        </>
      )}

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
            label={t('token')}
            onChange={handleChange}
            value={values.token}
            message={errors.token}
          />
        </>
      )}
    </>
  )
}

export default GitlabRegistryFields
