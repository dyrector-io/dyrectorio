export const DyoLabel = (
  props: React.LabelHTMLAttributes<HTMLLabelElement>,
) => {
  return (
    <label
      {...props}
      className={`${props.className} font-bold font-dyo-dark-purple`}
    >
      {props.children}
    </label>
  )
}
