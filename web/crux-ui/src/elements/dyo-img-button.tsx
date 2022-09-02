/* eslint-disable react/button-has-type */
import clsx from 'clsx'

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
  const { outlined, secondary, disabled, colorClassName, className, onClick, alt, height, width, src } = props

  const defaultColor = outlined ? (secondary ? 'ring-warning-orange' : 'ring-dyo-turquoise') : null
  const disabledColor = outlined ? 'ring-light-grey' : null
  const color = disabled ? disabledColor : colorClassName ?? defaultColor

  const ring = outlined ? 'ring-2' : null

  return (
    <button className={clsx(color, ring, className, 'rounded')} disabled={disabled} onClick={onClick}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} width={width ?? 24} height={height ?? 24} alt={alt} />
    </button>
  )
}

export default DyoImgButton
