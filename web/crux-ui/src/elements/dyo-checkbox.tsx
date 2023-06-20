import { FormikSetFieldValue } from '@app/utils'
import clsx from 'clsx'
import Image from 'next/image'

interface DyoCheckboxProps {
  className?: string
  name?: string
  checked?: boolean
  setFieldValue?: FormikSetFieldValue
  onCheckedChange?: (checked: boolean) => void
}

const DyoCheckbox = (props: DyoCheckboxProps) => {
  const { className, name, checked, setFieldValue, onCheckedChange } = props

  const handleCheckedChange = (isChecked: boolean) => {
    setFieldValue?.call(this, name, isChecked, false)
    onCheckedChange?.call(this, isChecked)
  }

  return (
    <div
      className={clsx(
        className,
        checked ? 'bg-dyo-turquoise' : 'border-2 border-light-grey',
        'flex w-5 h-5 rounded-sm cursor-pointer select-none',
      )}
      onClick={() => handleCheckedChange(!checked)}
    >
      {!checked ? null : <Image className="aspect-square" src="/check-white.svg" alt="check" width={20} height={20} />}

      <input type="checkbox" checked={checked} onChange={() => handleCheckedChange(!checked)} className="hidden" />
    </div>
  )
}

export default DyoCheckbox
