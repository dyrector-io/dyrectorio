import { DyoFileUploadInput } from '@app/elements/dyo-file-upload'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoLink from '@app/elements/dyo-link'
import DyoTextArea from '@app/elements/dyo-text-area'
import DyoToggle from '@app/elements/dyo-toggle'
import { EditableGoogleRegistryDetails } from '@app/models'
import { EditRegistryTypeProps, formikSetFieldValueOrIgnore } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'

const GoogleRegistryFields = (props: EditRegistryTypeProps<EditableGoogleRegistryDetails>) => {
  const { formik } = props
  const { values, errors, handleChange, setFieldValue } = formik

  const { t } = useTranslation('registries')

  const editing = !!values.id

  const uploadHandler = keyFile => {
    const fileReader = new FileReader()
    fileReader.readAsText(keyFile, 'UTF-8')
    fileReader.onload = async (event): Promise<void> => {
      const json = JSON.parse(event.target.result.toString())
      await setFieldValue('user', json.client_email ? json.client_email : '')
      await setFieldValue('token', json.private_key ? json.private_key : '')
    }
  }

  return (
    <>
      <DyoLabel className="mt-2">
        {t('tips.google')}
        <span className="ml-1">{t('tips.learnMoreRegistry')}</span>
        <DyoLink
          className="ml-1 text-blue-300"
          href="https://cloud.google.com/artifact-registry/docs"
          target="_blank"
          qaLabel="google-artifact-registry-docs"
        >
          {t('here')}
        </DyoLink>
        .
      </DyoLabel>
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
        name="imageNamePrefix"
        type="text"
        label={t('organization')}
        placeholder={t('placeholders.google.organization')}
        onChange={handleChange}
        value={values.imageNamePrefix}
        message={errors.imageNamePrefix}
      />

      <DyoToggle
        className="mt-8"
        name="public"
        label={t('common:public')}
        checked={values.public}
        setFieldValue={async (field, value, shouldValidate): Promise<void> => {
          if (!value) {
            await setFieldValue('user', '', false)
            await setFieldValue('token', '', false)
          }

          await setFieldValue(field, value, shouldValidate)
        }}
      />

      {!values.public && (
        <>
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
              <DyoFileUploadInput
                name="uploadFile"
                accept="application/JSON"
                multiple={false}
                label={t('keyFile')}
                handleFile={event => uploadHandler(event)}
              />

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

              <DyoTextArea
                className="max-w-lg"
                grow
                name="token"
                label={t('privateKey')}
                onChange={handleChange}
                value={values.token}
                message={errors.token}
              />
            </>
          )}
        </>
      )}
    </>
  )
}

export default GoogleRegistryFields
