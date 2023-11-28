import clsx from 'clsx'
import { sendQASelectRadioButtonEvent } from 'quality-assurance'
import { DyoLabel } from './dyo-label'

type DyoRadioButtonProps = {
  disabled?: boolean
  className?: string
  label?: string
  checked?: boolean
  onSelect?: VoidFunction
  qaLabel: string
}

const DyoRadioButton = (props: DyoRadioButtonProps) => {
  const { className, disabled, label, checked, onSelect, qaLabel } = props

  const handleCheckedChange = () => {
    if (disabled) {
      return
    }

    onSelect?.call(this)
    sendQASelectRadioButtonEvent(qaLabel)
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
