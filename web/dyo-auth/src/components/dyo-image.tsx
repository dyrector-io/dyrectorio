import Image, { ImageProps } from 'next/image'

const DyoImage = (props: ImageProps) => {
  const { src, ...forwardedProps } = props

  let imagePath = src
  if (typeof src === 'string' && src.startsWith('/')) {
    imagePath = `/auth${src}`
  }

  return <Image src={imagePath} {...forwardedProps} />
}

export default DyoImage
