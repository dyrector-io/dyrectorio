import useTranslation from 'next-translate/useTranslation'
import DyoChips, { DyoChipsProps } from './dyo-chips'

interface DyoFilterChipsProps<T> extends DyoChipsProps<T> {
  addAllOption?: boolean
}

const DyoFilterChips = <T,>(props: DyoFilterChipsProps<T>) => {
  var { addAllOption, converter } = props

  const { t } = useTranslation('common')

  return (
    <DyoChips
      {...props}
      converter={it => {
        return !it && addAllOption ? t('all') : converter(it)
      }}
    />
  )
}

export default DyoFilterChips
