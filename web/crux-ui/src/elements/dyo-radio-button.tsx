import clsx from 'clsx'
import { DyoLabel } from './dyo-label'

interface DyoCheckboxProps {
  disabled?: boolean
  className?: string
  label?: string
  checked?: boolean
  onSelect?: VoidFunction
}

const DyoRadioButton = (props: DyoCheckboxProps) => {
  const { className, disabled, label, checked, onSelect } = props

  const handleCheckedChange = () => {
    if (disabled) {
      return
    }

    onSelect?.call(this)
  }

  return (
    <div className="flex flex-row" onClick={() => handleCheckedChange()}>
      <div className={clsx(className, 'flex ring-light-grey w-4 h-4 rounded-full ring-2 cursor-pointer m-2')}>
        {!checked ? null : <div className="self-center rounded-full bg-dyo-turquoise w-3 h-3 mx-auto" />}
        <input type="radio" checked={checked} onChange={() => handleCheckedChange()} className="hidden" />
      </div>

      <DyoLabel className="my-auto mx-2">{label}</DyoLabel>
    </div>
  )
}

export default DyoRadioButton
