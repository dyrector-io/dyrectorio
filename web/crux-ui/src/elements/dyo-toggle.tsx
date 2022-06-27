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

export const DyoToggle = (props: DyoToggleProps) => {
  const { name, checked, setFieldValue, onCheckedChange } = props

  const handleCheckedChange = checked => {
    setFieldValue?.call(this, name, checked, false)
    onCheckedChange?.call(this, checked)
  }

  return (
    <Switch.Group as="div" className={clsx(props.className, 'w-full flex justify-center')}>
      <Switch.Label as="div" className="mr-4">
        {checked ? props.nameChecked : props.nameUnchecked}
      </Switch.Label>

      <Switch
        checked={checked}
        onChange={handleCheckedChange}
        className={`${
          checked ? 'bg-dyo-turquoise' : 'bg-light'
        } relative inline-flex items-center h-6 rounded-full w-11 outline-none`}
      >
        <span className="sr-only">{checked ? props.nameChecked : props.nameUnchecked}</span>
        <span
          className={`${
            checked ? 'translate-x-6' : 'translate-x-1'
          } inline-block w-4 h-4 transform bg-white rounded-full transition ease-in-out duration-200`}
        />
      </Switch>
    </Switch.Group>
  )
}
