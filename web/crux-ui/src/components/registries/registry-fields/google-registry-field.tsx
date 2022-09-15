import { DyoFileUploadInput } from '@app/elements/dyo-file-upload'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoSwitch from '@app/elements/dyo-switch'
import DyoTextArea from '@app/elements/dyo-text-area'
import { GoogleRegistryDetails } from '@app/models'
import { EditRegistryTypeProps } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'

const GoogleRegistryFields = (props: EditRegistryTypeProps<GoogleRegistryDetails>) => {
  const { formik } = props

  const { t } = useTranslation('registries')

  const uploadHandler = keyFile => {
    const fileReader = new FileReader()
    fileReader.readAsText(keyFile, 'UTF-8')
    fileReader.onload = event => {
      const json = JSON.parse(event.target.result.toString())
      formik.setFieldValue('user', json.client_email ? json.client_email : '')
      formik.setFieldValue('token', json.private_key ? json.private_key : '')
    }
  }

  return (
    <>
      <DyoLabel className="text-light mt-2">{t('tips.google')}</DyoLabel>

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

      <div className="flex mt-4">
        <DyoLabel className="mr-2">{t('private')}</DyoLabel>

        <DyoSwitch
          fieldName="private"
          checked={formik.values.private}
          setFieldValue={(field: string, value: boolean, shouldValidate?: boolean | undefined) => {
            if (!value) {
              formik.setFieldValue('user', '', false)
              formik.setFieldValue('token', '', false)
            }
            return formik.setFieldValue(field, value, shouldValidate)
          }}
        />
      </div>

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
