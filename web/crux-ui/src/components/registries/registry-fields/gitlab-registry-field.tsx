import DyoChips, { chipsQALabelFromValue } from '@app/elements/dyo-chips'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoLink from '@app/elements/dyo-link'
import DyoPassword from '@app/elements/dyo-password'
import DyoToggle from '@app/elements/dyo-toggle'
import { GITLAB_NAMESPACE_VALUES, GitlabRegistryDetails, RegistryNamespace } from '@app/models'
import { EditRegistryTypeProps } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'

const GitlabRegistryFields = (props: EditRegistryTypeProps<GitlabRegistryDetails>) => {
  const { formik } = props

  const { t } = useTranslation('registries')

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

      <div className="flex flex-wrap mt-8">
        <DyoLabel className="mr-2 my-auto">{t('namespaceType')}</DyoLabel>

        <DyoChips
          name="gitlabNamespaceType"
          choices={GITLAB_NAMESPACE_VALUES}
          selection={formik.values.namespace}
          converter={(it: RegistryNamespace) => t(`namespace.${it}`)}
          onSelectionChange={it => formik.setFieldValue('namespace', it, true)}
          qaLabel={chipsQALabelFromValue}
        />
      </div>

      <DyoInput
        className="max-w-lg"
        grow
        name="imageNamePrefix"
        type="text"
        label={formik.values.namespace === 'group' ? t('group') : t('project')}
        onChange={formik.handleChange}
        value={formik.values.imageNamePrefix}
        message={formik.errors.imageNamePrefix}
      />

      <DyoToggle
        className="mt-8"
        name="selfManaged"
        label={t('selfManaged')}
        checked={formik.values.selfManaged}
        setFieldValue={async (field, value, shouldValidate): Promise<void> => {
          if (!value) {
            await formik.setFieldValue('url', '', false)
            await formik.setFieldValue('apiUrl', '', false)
          }

          await formik.setFieldValue(field, value, shouldValidate)
        }}
      />

      {!formik.values.selfManaged ? null : (
        <>
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

          <DyoInput
            className="max-w-lg"
            grow
            name="apiUrl"
            type="text"
            label={t('apiUrl')}
            onChange={formik.handleChange}
            value={formik.values.apiUrl}
            message={formik.errors.apiUrl}
          />
        </>
      )}
    </>
  )
}

export default GitlabRegistryFields
