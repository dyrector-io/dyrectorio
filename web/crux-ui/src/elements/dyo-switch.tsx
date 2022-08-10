import { FormikSetFieldValue } from '@app/utils'
import { Switch } from '@headlessui/react'
import React from 'react'

interface DyoSwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'ref'> {
  fieldName: string
  checked?: boolean
  setFieldValue?: FormikSetFieldValue
  onCheckedChange?: (checked: boolean) => void
}

export const DyoSwitch = (props: DyoSwitchProps) => {
  const { fieldName, checked, setFieldValue, onCheckedChange } = props

  const handleCheckedChange = checked => {
    setFieldValue?.call(this, fieldName, checked, false)
    onCheckedChange?.call(this, checked)
  }

  return (
      <Switch
        checked={checked}
        onChange={handleCheckedChange}
        className={`${
          checked ? 'bg-dyo-turquoise' : 'bg-light'
        } relative inline-flex items-center h-6 rounded-full w-11 outline-none`}
      >
        <span
          className={`${
            checked ? 'translate-x-6' : 'translate-x-1'
          } inline-block w-4 h-4 transform bg-white rounded-full transition ease-in-out duration-200`}
        />
      </Switch>
  )
}
