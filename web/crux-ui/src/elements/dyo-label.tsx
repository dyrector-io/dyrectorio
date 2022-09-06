import clsx from 'clsx'

export interface DyoLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  textColor?: string
}

export const DyoLabel = (props: DyoLabelProps) => {
  const { className, textColor, children, ...forwardedProps } = props

  return (
    <label {...forwardedProps} className={clsx(className, textColor ?? 'text-light-eased')}>
      {children}
    </label>
  )
}
