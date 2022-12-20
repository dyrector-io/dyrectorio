import { templateImageUrl } from '@app/routes'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { useCallback, useState } from 'react'

export interface TemplateImageProps {
  templateId: string
}

const TemplateImage = (props: TemplateImageProps) => {
  const { templateId } = props

  const { t } = useTranslation('templates')
  const [error, setError] = useState<boolean>(false)

  const onError = useCallback(() => {
    setError(true)
  }, [])

  const loader = () => (error ? '/default_template.svg' : templateImageUrl(templateId))

  return (
    <Image
      className="rounded"
      alt={t('templateImage')}
      src="/default_template.svg"
      width={100}
      height={100}
      loader={loader}
      onError={onError}
    />
  )
}

export default TemplateImage
