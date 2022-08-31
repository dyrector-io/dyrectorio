import clsx from 'clsx'
import Image from 'next/image'

interface DyoImgButtonProps {
  className?: string
  src: string
  alt: string
  onClick: VoidFunction
  width?: number
  height?: number
}

const DyoImgButton = (props: DyoImgButtonProps) => {
  const { className, src, alt, onClick, width, height } = props

  return (
    <div className={clsx('flex', className)}>
      <Image
        className="cursor-pointer"
        onClick={() => onClick()}
        src={src}
        width={width ?? 24}
        height={height ?? 24}
        alt={alt}
        layout="fixed"
      />
    </div>
  )
}

export default DyoImgButton
