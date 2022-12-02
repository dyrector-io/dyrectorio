import clsx from 'clsx'
import Image from 'next/image'

interface DyoImgButtonProps {
  className?: string
  colorClassName?: string
  disabled?: boolean
  src: string
  alt: string
  onClick: VoidFunction
  width?: number
  height?: number
  secondary?: boolean
  outlined?: boolean
}

const DyoImgButton = (props: DyoImgButtonProps) => {
  const { outlined, secondary, disabled, colorClassName, className, onClick, alt, width = 24, height = 24, src } = props

  const defaultColor = outlined ? (secondary ? 'ring-warning-orange' : 'ring-dyo-turquoise') : null
  const disabledColor = outlined ? 'ring-light-grey' : null
  const color = disabled ? disabledColor : colorClassName ?? defaultColor

  const ring = outlined ? 'ring-2' : null

  return (
    /* eslint-disable-next-line react/button-has-type */
    <button
      className={clsx(color, ring, className, 'rounded grid items-center', disabled ? 'opacity-40' : null)}
      disabled={disabled}
      onClick={onClick}
    >
      <Image layout="fixed" src={src} width={width} height={height} alt={alt} />
    </button>
  )
}

export default DyoImgButton
