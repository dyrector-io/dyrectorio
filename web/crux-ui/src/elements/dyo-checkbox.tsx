import { FormikSetFieldValue } from '@app/utils'
import clsx from 'clsx'
import Image from 'next/image'
import { sendQACheckEvent } from 'quality-assurance'

interface DyoCheckboxProps {
  className?: string
  name?: string
  checked?: boolean
  setFieldValue?: FormikSetFieldValue
  onCheckedChange?: (
    checked: boolean,
    event: React.MouseEvent<HTMLDivElement, MouseEvent> | React.ChangeEvent<HTMLInputElement>,
  ) => void
  qaLabel: string
}

const DyoCheckbox = (props: DyoCheckboxProps) => {
  const { className, name, checked, setFieldValue, onCheckedChange, qaLabel } = props

  const handleCheckedChange = (
    isChecked: boolean,
    event: React.MouseEvent<HTMLDivElement, MouseEvent> | React.ChangeEvent<HTMLInputElement>,
  ) => {
    setFieldValue?.call(this, name, isChecked, false)
    onCheckedChange?.call(this, isChecked, event)
    sendQACheckEvent(
      {
        elementType: 'div',
        label: qaLabel,
      },
      isChecked,
    )
  }

  return (
    <div
      className={clsx(
        className,
        checked ? 'bg-dyo-turquoise' : 'border-2 border-light-grey',
        'flex w-5 h-5 rounded-sm cursor-pointer select-none',
      )}
      onClick={e => handleCheckedChange(!checked, e)}
    >
      {!checked ? null : <Image className="aspect-square" src="/check-white.svg" alt="check" width={20} height={20} />}

      <input type="checkbox" checked={checked} onChange={ev => handleCheckedChange(!checked, ev)} className="hidden" />
    </div>
  )
}

export default DyoCheckbox
