import { DyoFileUploadInput } from '@app/elements/dyo-file-upload'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoLink from '@app/elements/dyo-link'
import DyoTextArea from '@app/elements/dyo-text-area'
import DyoToggle from '@app/elements/dyo-toggle'
import { GoogleRegistryDetails } from '@app/models'
import { EditRegistryTypeProps } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'

const GoogleRegistryFields = (props: EditRegistryTypeProps<GoogleRegistryDetails>) => {
  const { formik } = props

  const { t } = useTranslation('registries')

  const uploadHandler = keyFile => {
    const fileReader = new FileReader()
    fileReader.readAsText(keyFile, 'UTF-8')
    fileReader.onload = async (event): Promise<void> => {
      const json = JSON.parse(event.target.result.toString())
      await formik.setFieldValue('user', json.client_email ? json.client_email : '')
      await formik.setFieldValue('token', json.private_key ? json.private_key : '')
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
        onChange={formik.handleChange}
        value={formik.values.url}
        message={formik.errors.url}
      />

      <DyoInput
        className="max-w-lg"
        grow
        name="imageNamePrefix"
        type="text"
        label={t('organization')}
        onChange={formik.handleChange}
        value={formik.values.imageNamePrefix}
        message={formik.errors.imageNamePrefix}
      />

      <DyoToggle
        className="mt-8"
        name="private"
        label={t('private')}
        checked={formik.values.private}
        setFieldValue={async (field, value, shouldValidate): Promise<void> => {
          if (!value) {
            await formik.setFieldValue('user', '', false)
            await formik.setFieldValue('token', '', false)
          }

          await formik.setFieldValue(field, value, shouldValidate)
        }}
      />

      {!formik.values.private ? null : (
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
            onChange={formik.handleChange}
            value={formik.values.user}
            message={formik.errors.user}
          />

          <DyoTextArea
            className="max-w-lg"
            grow
            name="token"
            label={t('privateKey')}
            onChange={formik.handleChange}
            value={formik.values.token}
            message={formik.errors.token}
          />
        </>
      )}
    </>
  )
}

export default GoogleRegistryFields
