import { templateImageUrl } from '@app/routes'
import Image from 'next/image'
import { useState } from 'react'

export interface TemplateImageProps {
  templateId: string
}

const TemplateImage = (props: TemplateImageProps) => {
  const { templateId } = props

  const [error, setError] = useState<boolean>(false)

  return error ? (
    <Image src="/default_template.svg" width={100} height={100} />
  ) : (
    <img src={templateImageUrl(templateId)} alt="Template" width={100} height={100} onError={() => setError(true)} />
  )
}

export default TemplateImage
