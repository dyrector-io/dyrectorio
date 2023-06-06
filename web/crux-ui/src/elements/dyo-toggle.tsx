import { FormikSetFieldValue } from '@app/utils'
import { Switch } from '@headlessui/react'
import clsx from 'clsx'
import React from 'react'

interface DyoToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'ref'> {
  nameChecked: string
  nameUnchecked: string
  checked?: boolean
  setFieldValue?: FormikSetFieldValue
  onCheckedChange?: (checked: boolean) => void
}

const DyoToggle = (props: DyoToggleProps) => {
  const { name, checked, setFieldValue, onCheckedChange, className, nameUnchecked, nameChecked, disabled } = props

  const handleCheckedChange = (isChecked: boolean) => {
    setFieldValue?.call(this, name, isChecked, false)
    onCheckedChange?.call(this, isChecked)
  }

  return (
    <Switch.Group as="div" className={clsx('flex', className ?? 'w-full justify-center')}>
      <Switch.Label as="div" className="text-bright mr-4">
        {checked ? nameChecked : nameUnchecked}
      </Switch.Label>

      <Switch
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={handleCheckedChange}
        className={`${
          checked ? 'bg-dyo-turquoise' : 'bg-light'
        } relative inline-flex items-center h-6 rounded-full w-11 outline-none`}
      >
        <span className="sr-only">{checked ? nameChecked : nameUnchecked}</span>
        <span
          className={`${
            checked ? 'translate-x-6' : 'translate-x-1'
          } inline-block w-4 h-4 transform bg-white rounded-full transition ease-in-out duration-200`}
        />
      </Switch>
    </Switch.Group>
  )
}

export default DyoToggle
