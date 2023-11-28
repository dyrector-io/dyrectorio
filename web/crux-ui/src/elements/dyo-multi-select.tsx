import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import React, { useEffect, useState } from 'react'
import DyoCheckbox from './dyo-checkbox'
import DyoIcon from './dyo-icon'
import DyoMessage from './dyo-message'

export type DyoMultiSelectProps<T> = {
  className?: string
  name: string
  disabled?: boolean
  grow?: boolean
  message?: string
  messageType?: 'error' | 'info'
  choices: readonly T[]
  selection: string[]
  idConverter: (choice: T) => string
  labelConverter: (choice: T) => string
  onSelectionChange: (selection: string[]) => void
}

const DyoMultiSelect = <T,>(props: DyoMultiSelectProps<T>) => {
  const {
    message,
    messageType,
    disabled,
    className,
    grow,
    choices,
    selection,
    idConverter,
    labelConverter,
    onSelectionChange,
    name,
  } = props

  const { t } = useTranslation('common')

  const [selectorVisible, setSelectorVisible] = useState<boolean>(false)

  const toggleSelection = (ev: React.MouseEvent | React.ChangeEvent, id: string) => {
    if (disabled) {
      return
    }

    ev.preventDefault()
    ev.stopPropagation()

    if (selection.includes(id)) {
      const newSelection = [...selection]
      const index = selection.indexOf(id)
      if (index >= 0) {
        newSelection.splice(index, 1)
      }
      onSelectionChange(newSelection)
    } else {
      onSelectionChange([...selection, id])
    }
  }

  const toggleDropdown = ev => {
    if (disabled) {
      return
    }

    ev.preventDefault()
    ev.stopPropagation()
    setSelectorVisible(!selectorVisible)
  }

  const outsideClickListener = () => {
    if (!selectorVisible) {
      return
    }

    setSelectorVisible(false)
  }

  useEffect(() => {
    document.addEventListener('click', outsideClickListener, false)
    return () => {
      document.removeEventListener('click', outsideClickListener, false)
    }
  })

  return (
    <>
      <div className={clsx(className, 'relative', grow ? null : 'w-80')}>
        <div className="w-full">
          <div
            className={clsx(
              'w-full appearance-none bg-medium leading-7 h-11 pl-4 p-2 ring-2 focus:outline-none focus:dark',
              disabled
                ? 'text-bright-muted ring-light-grey-muted cursor-not-allowed'
                : 'text-bright ring-light-grey cursor-pointer',
              'line-clamp-1 pr-6',
              selectorVisible ? 'rounded-t-md' : 'rounded-md',
            )}
            onClick={toggleDropdown}
          >
            <label>
              {!selection || selection.length === 0
                ? t('none')
                : selection
                    .map(it => {
                      const item = choices.find(elem => idConverter(elem) === it)
                      return item ? labelConverter(item) : null
                    })
                    .filter(it => !!it)
                    .join(', ')}
            </label>
          </div>
          <div className="pointer-events-none pr-2 absolute h-[24px] right-0 top-1/2 transform -translate-y-1/2">
            <DyoIcon src="/chevron_down.svg" alt={t('common:down')} aria-hidden size="md" />
          </div>
        </div>

        {selectorVisible && (
          <div className="absolute w-full z-50 mt-0.5 bg-medium ring-2 rounded-b-md ring-light-grey max-h-60 overflow-y-auto overflow-x-hidden">
            {choices.map((it, index) => {
              const itemId = idConverter(it)
              return (
                <div
                  key={itemId}
                  className="p-2 flex flex-row items-center cursor-pointer hover:bg-medium-eased"
                  onClick={e => toggleSelection(e, itemId)}
                >
                  <DyoCheckbox
                    className="flex-none mr-2"
                    checked={selection.includes(itemId)}
                    onCheckedChange={(_, ev) => toggleSelection(ev, itemId)}
                    qaLabel={`${name}-${index}`}
                  />
                  <label className="text-light-eased cursor-pointer line-clamp-1">{labelConverter(it)}</label>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {!message ? null : <DyoMessage message={message} messageType={messageType} />}
    </>
  )
}

export default DyoMultiSelect

DyoMultiSelect.displayName = 'DyoMultiSelect'
DyoMultiSelect.defaultProps = {
  className: null,
  disabled: false,
  grow: false,
  message: null,
  messageType: 'error',
}
