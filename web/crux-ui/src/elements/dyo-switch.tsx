import { FormikSetFieldValue } from '@app/utils'
import { Switch } from '@headlessui/react'
import clsx from 'clsx'
import React from 'react'

interface DyoSwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'ref'> {
  fieldName?: string
  checked?: boolean
  setFieldValue?: FormikSetFieldValue
  onCheckedChange?: (checked: boolean) => void
}

const DyoSwitch = (props: DyoSwitchProps) => {
  const { className, fieldName, checked, disabled, setFieldValue, onCheckedChange } = props

  const handleCheckedChange = (isChecked: boolean) => {
    if (fieldName) {
      setFieldValue?.call(this, fieldName, isChecked, false)
    }

    onCheckedChange?.call(this, isChecked)
  }

  return (
    <Switch
      checked={checked}
      onChange={handleCheckedChange}
      disabled={disabled}
      className={clsx(
        checked ? 'bg-dyo-turquoise' : 'bg-light',
        'relative inline-flex items-center h-6 rounded-full w-11 outline-none',
        disabled ? 'cursor-not-allowed' : null,
        className,
      )}
    >
      <span
        className={clsx(
          checked ? 'translate-x-6' : 'translate-x-1',
          'inline-block w-4 h-4 transform bg-white rounded-full transition ease-in-out duration-200',
        )}
      />
    </Switch>
  )
}

export default DyoSwitch
