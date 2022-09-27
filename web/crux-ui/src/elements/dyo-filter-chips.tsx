import useTranslation from 'next-translate/useTranslation'
import DyoChips, { DyoChipsProps } from './dyo-chips'

const DyoFilterChips = <T,>(props: DyoChipsProps<T | 'all'>) => {
  const { converter: propsConverter, choices, initialSelection } = props

  const { t } = useTranslation('common')

  const converter = (it: T | 'all') => (it === 'all' ? t('all') : propsConverter(it))

  return (
    <DyoChips
      {...props}
      converter={converter}
      choices={['all', ...choices]}
      initialSelection={initialSelection ?? 'all'}
    />
  )
}

export default DyoFilterChips
