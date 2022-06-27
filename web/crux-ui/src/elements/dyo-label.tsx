import clsx from 'clsx'

export interface DyoLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  textColor?: string
}

export const DyoLabel = (props: DyoLabelProps) => {
  const { className, textColor, ...forwardedProps } = props

  return (
    <label {...forwardedProps} className={clsx(className, textColor ?? 'text-light-eased')}>
      {props.children}
    </label>
  )
}
