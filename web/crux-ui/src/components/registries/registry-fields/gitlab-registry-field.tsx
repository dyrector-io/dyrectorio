import DyoChips from '@app/elements/dyo-chips'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoToggle from '@app/elements/dyo-toggle'
import { GitlabRegistryDetails, GITLAB_NAMESPACE_VALUES, RegistryNamespace } from '@app/models'
import { EditRegistryTypeProps } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import Link from 'next/link'

const GitlabRegistryFields = (props: EditRegistryTypeProps<GitlabRegistryDetails>) => {
  const { formik } = props

  const { t } = useTranslation('registries')

  return (
    <>
      <DyoLabel className="mt-2">
        {t('tips.gitlab')}
        <span className="ml-1">{t('tips.learnMorePat')}</span>
        <Link
          className="ml-1 text-blue-300"
          href="https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html"
          target="_blank"
        >
          {t('here')}
        </Link>
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
        label={t('token')}
        onChange={formik.handleChange}
        value={formik.values.token}
        message={formik.errors.token}
      />

      <div className="flex flex-wrap mt-8">
        <DyoLabel className="mr-2 my-auto">{t('namespaceType')}</DyoLabel>

        <DyoChips
          choices={GITLAB_NAMESPACE_VALUES}
          selection={formik.values.namespace}
          converter={(it: RegistryNamespace) => t(`namespace.${it}`)}
          onSelectionChange={it => formik.setFieldValue('namespace', it, true)}
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
        setFieldValue={(field, value, shouldValidate) => {
          if (!value) {
            formik.setFieldValue('url', '', false)
            formik.setFieldValue('apiUrl', '', false)
          }

          return formik.setFieldValue(field, value, shouldValidate)
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
