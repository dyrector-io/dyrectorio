import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoMessage from '@app/elements/dyo-message'
import useTranslation from 'next-translate/useTranslation'

interface EditImageHeadingProps {
  className?: string
  imageName: string
  imageTag: string
  containerName: string
  errorMessage?: string
}

const EditImageHeading = (props: EditImageHeadingProps) => {
  const { imageName, imageTag, containerName, errorMessage, className } = props

  const { t } = useTranslation('common')

  return (
    <div className={className}>
      <div className="flex flex-row items-center">
        <DyoLabel className="mr-4">{t('image')}</DyoLabel>

        <DyoHeading element="h4" className="text-lg text-bright">
          {imageName}
          {imageTag ? ` : ${imageTag}` : null}
        </DyoHeading>
      </div>

      <div className="flex flex-row items-center">
        <DyoLabel className="mr-4">{t('container')}</DyoLabel>

        <DyoHeading element="h4" className="text-lg text-bright">
          {containerName}
        </DyoHeading>
      </div>

      {errorMessage ? <DyoMessage message={errorMessage} messageType="error" /> : null}
    </div>
  )
}

export default EditImageHeading
