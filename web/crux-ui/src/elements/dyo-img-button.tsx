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
  const { outlined, secondary, disabled, colorClassName } = props

  const defaultColor = secondary
    ? outlined
      ? 'ring-warning-orange'
      : 'bg-warning-orange'
    : outlined
    ? 'ring-dyo-turquoise'
    : 'bg-dyo-turquoise'
  const disabledColor = outlined ? 'ring-light-grey' : 'bg-light-grey'
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
