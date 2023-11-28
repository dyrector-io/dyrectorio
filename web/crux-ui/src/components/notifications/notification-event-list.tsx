import DyoCheckbox from '@app/elements/dyo-checkbox'
import { DyoLabel } from '@app/elements/dyo-label'
import { NotificationEventType, NOTIFICATION_EVENT_VALUES } from '@app/models'
import { snakeToCamel } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'

export interface NotificationEventListProps {
  value: NotificationEventType[]
  onChanged: (value: NotificationEventType[]) => void
}

export const NotificationEventList = (props: NotificationEventListProps) => {
  const { value, onChanged } = props

  const { t } = useTranslation('notifications')

  const onCheckChanged = (checked: boolean, item: NotificationEventType) => {
    if (checked && !value.includes(item)) {
      onChanged([...value, item])
    } else if (!checked && value.includes(item)) {
      const newValue = [...value]
      const index = newValue.indexOf(item)
      if (index > -1) {
        newValue.splice(index, 1)
      }
      onChanged(newValue)
    }
  }

  return (
    <>
      {NOTIFICATION_EVENT_VALUES.map(it => {
        const textKey = snakeToCamel(it)
        const checked = value.includes(it)

        return (
          <div key={it} className="flex flex-row p-auto mb-5 pl-4">
            <DyoCheckbox
              className="my-auto mr-2"
              checked={checked}
              onCheckedChange={check => onCheckChanged(check, it)}
              qaLabel={textKey}
            />

            <DyoLabel className="cursor-pointer" onClick={() => onCheckChanged(!checked, it)}>
              {t(`eventType.${textKey}`)}
            </DyoLabel>
          </div>
        )
      })}
    </>
  )
}
