import { FormikSetFieldValue } from '@app/utils'
import clsx from 'clsx'

interface DyoCheckboxProps {
  className?: string
  name?: string
  label?: string
  checked?: boolean
  setFieldValue?: FormikSetFieldValue
  onCheckedChange?: (checked: boolean) => void
}

const DyoCheckbox = (props: DyoCheckboxProps) => {
  const { className, name, label, checked, setFieldValue, onCheckedChange } = props

  const handleCheckedChange = checked => {
    setFieldValue?.call(this, name, checked, false)
    onCheckedChange?.call(this, checked)
  }

  return (
    <div
      className={clsx(
        className,
        checked ? 'bg-dyo-turquoise' : 'border-2 border-light-grey',
        'flex w-5 h-5 rounded-sm cursor-pointer',
      )}
      onClick={() => handleCheckedChange(!checked)}
    >
      {!checked ? null : <img src="/check-white.svg" />}

      <input type="checkbox" checked={checked} onChange={() => handleCheckedChange(!checked)} className="hidden" />
    </div>
  )
}

export default DyoCheckbox
