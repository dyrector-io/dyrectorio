import clsx from 'clsx'
import Image from 'next/image'

interface DyoIconProps {
  className?: string
  imageClassName?: string
  src: string
  alt: string
  size?: 'sm' | 'md' | 'lg'
  onClick?: VoidFunction
}

const DyoIcon = (props: DyoIconProps) => {
  const { className, imageClassName, src, alt, size: propsSize = 'sm', onClick } = props
  const size = propsSize === 'sm' ? 16 : propsSize === 'md' ? 24 : 32

  return (
    <span
      className={clsx('inline-block', className)}
      style={{
        minWidth: size,
        minHeight: size,
      }}
    >
      <Image
        className={clsx(
          'aspect-square object-contain object-center',
          imageClassName,
          onClick ? 'cursor-pointer' : null,
        )}
        title={alt}
        src={src}
        alt={alt}
        width={size}
        height={size}
        onClick={onClick}
      />
    </span>
  )
}

export default DyoIcon
