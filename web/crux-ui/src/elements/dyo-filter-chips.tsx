import useTranslation from 'next-translate/useTranslation'
import DyoChips, { DyoChipsProps } from './dyo-chips'

const DyoFilterChips = <T,>(props: DyoChipsProps<T | 'all'>) => {
  const { converter, choices, initialSelection } = props

  const { t } = useTranslation('common')

  return (
    <DyoChips
      {...props}
      converter={it => (it === 'all' ? t('all') : converter(it))}
      choices={['all' as 'all', ...choices]}
      initialSelection={initialSelection ?? 'all'}
    />
  )
}

export default DyoFilterChips
