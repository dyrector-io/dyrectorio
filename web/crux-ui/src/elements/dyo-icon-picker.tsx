import { FormikSetFieldValue } from '@app/utils'
import clsx from 'clsx'
import { useState } from 'react'
import DyoBadge from './dyo-badge'

interface DyoIconPickerProps {
  className?: string
  name: string
  value?: string
  setFieldValue: FormikSetFieldValue
}

export const DYO_ICONS = [
  'goat',
  'jellyfish',
  'kangaroo',
  'shark',
  'sloth',
  'buffalo',
  'cat',
  'llama',
  'bug',
  'shrimp',
  'donkey',
  'flamingo',
  'lion',
  'hedgehog',
  'giraffe',
  'penguin',
  'bat',
  'goose',
  'seal',
  'spider',
  'squirrel',
  'monkey',
  'gecko',
  'owl',
  'dog',
  'rhino',
  'bee',
  'dino',
  'sheep',
  'crow',
  'snail',
]

const DyoIconPicker = (props: DyoIconPickerProps) => {
  const { name, value, setFieldValue, className } = props

  const [selected, setSelected] = useState(value ?? null)

  const onSelectIcon = icon => {
    if (selected === icon) {
      icon = null
    }

    setSelected(icon)
    setFieldValue(name, icon)
  }

  return (
    <div className={className}>
      {DYO_ICONS.map(icon => (
        <button
          key={icon}
          type="button"
          className={clsx(
            icon === selected ? 'border-1 ring-2 ring-dyo-turquoise bg-light-grey rounded-full' : null,
            'p-2 leading-[0px]',
          )}
          onClick={() => onSelectIcon(icon)}
        >
          <DyoBadge icon={icon} />
        </button>
      ))}
    </div>
  )
}

export default DyoIconPicker
