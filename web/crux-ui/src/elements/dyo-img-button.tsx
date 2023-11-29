import clsx from 'clsx'
import Image from 'next/image'
import { sendQAClickEvent } from 'quality-assurance'

interface DyoImgButtonProps {
  className?: string
  colorClassName?: string
  imageClassName?: string
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
  const {
    outlined,
    secondary,
    disabled,
    colorClassName,
    imageClassName,
    className,
    onClick: propsOnClick,
    alt,
    width,
    height,
    src,
  } = props

  const defaultColor = outlined ? (secondary ? 'ring-warning-orange' : 'ring-dyo-turquoise') : null
  const disabledColor = outlined ? 'ring-light-grey' : null
  const color = disabled ? disabledColor : colorClassName ?? defaultColor

  const ring = outlined ? 'ring-2' : null

  const onClick = () => {
    propsOnClick()
    sendQAClickEvent({
      elementType: 'img',
      label: alt,
    })
  }

  return (
    /* eslint-disable-next-line react/button-has-type */
    <button
      className={clsx(color, ring, className, 'rounded grid items-center', disabled ? 'opacity-40' : null)}
      disabled={disabled}
      onClick={onClick}
    >
      <Image
        className={imageClassName}
        src={src}
        width={width ?? 24}
        height={height ?? 24}
        alt={alt}
        style={!width !== !height ? { width: width ?? 'auto', height: height ?? 'auto' } : null}
      />
    </button>
  )
}

export default DyoImgButton
