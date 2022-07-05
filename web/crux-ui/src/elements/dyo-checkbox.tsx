import { FormikSetFieldValue } from '@app/utils'
import clsx from 'clsx'
import Image from 'next/image'

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
      {!checked ? null : <Image src="/check-white.svg" alt="check" layout="fixed" width={20} height={20} />}

      <input type="checkbox" checked={checked} onChange={() => handleCheckedChange(!checked)} className="hidden" />
    </div>
  )
}

export default DyoCheckbox
