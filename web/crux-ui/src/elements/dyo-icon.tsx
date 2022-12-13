import clsx from 'clsx'
import Image from 'next/image'

interface DyoIconProps {
  className?: string
  imageClassName?: string
  src: string
  alt: string
  size?: 'sm' | 'md' | 'lg'
}

const DyoIcon = (props: DyoIconProps) => {
  const { className, imageClassName, src, alt, size: propsSize = 'sm' } = props
  const size = propsSize === 'sm' ? 16 : propsSize === 'md' ? 24 : 32

  return (
    <span
      className={className}
      style={{
        minWidth: size,
        minHeight: size,
      }}
    >
      <Image
        className={clsx('aspect-square object-contain object-center', imageClassName)}
        src={src}
        alt={alt}
        width={size}
        height={size}
      />
    </span>
  )
}

export default DyoIcon
