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
  primary?: boolean
  secondary?: boolean
  outlined?: boolean
}

const DyoImgButton = (props: DyoImgButtonProps) => {
  const { outlined, secondary, disabled, colorClassName } = props

  const defaultColor = outlined ? (secondary ? 'ring-warning-orange' : 'ring-dyo-turquoise') : null
  const disabledColor = outlined ? 'ring-light-grey' : null
  const color = disabled ? disabledColor : colorClassName ?? defaultColor

  const ring = outlined ? 'ring-2' : null

  return (
    <button className={clsx(color, ring, props.className, 'rounded')} disabled={props.disabled} onClick={props.onClick}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={props.src} width={props.width ?? 24} height={props.height ?? 24} alt={props.alt} />
    </button>
  )
}

export default DyoImgButton
