import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import useTranslation from 'next-translate/useTranslation'

type EditContainerConfigHeadingProps = {
  className?: string
  imageName: string
  imageTag: string | null
  containerName: string
}

const EditContainerConfigHeading = (props: EditContainerConfigHeadingProps) => {
  const { imageName, imageTag, containerName, className } = props

  const { t } = useTranslation('common')

  return (
    <div className={className}>
      <div className="flex flex-row items-center">
        <DyoLabel className="mr-4">{t('image')}</DyoLabel>

        <DyoHeading element="h4" className="text-lg text-bright">
          {imageName}
          {imageTag ? `:${imageTag}` : null}
        </DyoHeading>
      </div>

      <div className="flex flex-row items-center">
        <DyoLabel className="mr-4">{t('container')}</DyoLabel>

        <DyoHeading element="h4" className="text-lg text-bright">
          {containerName}
        </DyoHeading>
      </div>
    </div>
  )
}

export default EditContainerConfigHeading
