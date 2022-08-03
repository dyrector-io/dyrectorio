import en from 'date-fns/locale/en-GB'
import useTranslation from 'next-translate/useTranslation'
import React, { ForwardedRef, forwardRef } from 'react'
import DatePicker, { ReactDatePickerProps, registerLocale } from 'react-datepicker'
import { DyoInput } from './dyo-input'

export const DyoDatePicker = forwardRef((props: ReactDatePickerProps, ref: ForwardedRef<DatePicker>) => {
  registerLocale('en', en)

  const { t } = useTranslation('common')

  return (
    <div className={props.className}>
      <DatePicker
        locale="en"
        closeOnScroll
        dateFormat={t('dateFormat')}
        showPopperArrow={false}
        ref={ref}
        customInput={<DyoInput grow className="w-full" />}
        {...props}
        className=""
      />
    </div>
  )
})

DyoDatePicker.displayName = "DyoDatePicker"