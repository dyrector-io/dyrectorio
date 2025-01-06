import { FormikSetFieldValue } from '@app/utils'
import clsx from 'clsx'
import { sendQAToggleEvent } from 'quality-assurance'
import React from 'react'

type DyoToggleLabelOptions = {
  checked: string
  unchecked: string
}

interface DyoToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'ref'> {
  label?: string | DyoToggleLabelOptions
  labelClassName?: string
  checked?: boolean
  setFieldValue?: FormikSetFieldValue
  onCheckedChange?: (checked: boolean) => void
}

const DyoToggle = (props: DyoToggleProps) => {
  const { name, checked, labelClassName, setFieldValue, onCheckedChange, className, label, disabled } = props

  const checkedLabel = typeof label === 'string' ? label : label ? label.checked : null
  const uncheckedLabel = typeof label === 'string' ? label : label ? label.unchecked : null

  const onToggle = () => {
    setFieldValue?.call(null, name, !checked, false)
    onCheckedChange?.call(null, !checked)
    sendQAToggleEvent(name)
  }

  return (
    <div className={clsx('flex', className ?? 'w-full')}>
      {label && (
        <label className={clsx(labelClassName ?? 'text-light-eased mr-4', 'align-middle')}>
          {checked ? checkedLabel : uncheckedLabel}
        </label>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={checked ?? false}
        name={name}
        disabled={disabled}
        className={`${
          checked ? 'bg-dyo-turquoise' : 'bg-light'
        } relative inline-flex items-center h-6 rounded-full w-11 outline-none`}
        onClick={onToggle}
      >
        <span className="sr-only">{checked ? checkedLabel : uncheckedLabel}</span>

        <span
          className={`${
            checked ? 'translate-x-6' : 'translate-x-1'
          } inline-block w-4 h-4 transform bg-white rounded-full transition ease-in-out duration-200`}
        />
      </button>
    </div>
  )
}

export default DyoToggle
