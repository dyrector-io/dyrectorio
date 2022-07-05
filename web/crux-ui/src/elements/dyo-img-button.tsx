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
  return (
    <div className={clsx(props.className, 'flex')}>
      <Image
        className="cursor-pointer"
        onClick={() => props.onClick()}
        src={props.src}
        width={props.width ?? 24}
        height={props.height ?? 24}
        alt={props.alt}
      />
    </div>
  )
}

export default DyoImgButton
