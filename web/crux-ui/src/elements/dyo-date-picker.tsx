import useTranslation from 'next-translate/useTranslation'
import { ForwardedRef, forwardRef } from 'react'
import DatePicker, { ReactDatePickerProps } from 'react-datepicker'
import { DyoInput } from './dyo-input'

export const DyoDatePicker = forwardRef(
  (props: ReactDatePickerProps<never, boolean>, ref: ForwardedRef<DatePicker>) => {
    const { t } = useTranslation('common')

    const days = t('daysOfTheWeekShort', null, { returnObjects: true }) as string[]

    const months = t('months', null, { returnObjects: true }) as string[]

    const locale = {
      localize: {
        day: (n: string | number) => days[n],
        month: (n: string | number) => months[n],
      },
      formatLong: {
        date: () => t('dateFormat'),
      },
      options: {
        weekStartsOn: 1 /* Monday */,
        firstWeekContainsDate: 4,
      },
    } as Locale

    const { className, ...rest } = props

    return (
      <div className={className}>
        <DatePicker
          locale={locale}
          closeOnScroll
          dateFormat={t('dateFormat')}
          showPopperArrow={false}
          ref={ref}
          customInput={<DyoInput grow className="w-full" />}
          {...rest}
        />
      </div>
    )
  },
)

DyoDatePicker.displayName = 'DyoDatePicker'
