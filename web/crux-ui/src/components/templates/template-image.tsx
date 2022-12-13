import { templateImageUrl } from '@app/routes'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

export interface TemplateImageProps {
  templateId: string
}

const TemplateImage = (props: TemplateImageProps) => {
  const { templateId } = props

  const { t } = useTranslation('templates')

  const ref = useRef<HTMLImageElement>(null)
  const [error, setError] = useState<boolean>(false)

  const onError = useCallback(() => {
    setError(true)
  }, [])

  useEffect(() => {
    if (ref && ref.current) {
      const { complete, naturalHeight } = ref.current
      const errorLoadingImgBeforeHydration = complete && naturalHeight === 0

      if (errorLoadingImgBeforeHydration) {
        setError(true)
      }
    }
  }, [])

  return error ? (
    <Image src="/default_template.svg" width={100} height={100} />
  ) : (
    <img
      className="rounded"
      src={templateImageUrl(templateId)}
      alt={t('imageAlt')}
      width={100}
      height={100}
      ref={ref}
      onError={onError}
    />
  )
}

export default TemplateImage
