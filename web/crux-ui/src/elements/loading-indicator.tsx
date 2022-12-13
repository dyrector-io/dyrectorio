import useTranslation from 'next-translate/useTranslation'
import DyoIcon from './dyo-icon'

interface LoadingIndicatorProps {
  className?: string
}

const LoadingIndicator = (props: LoadingIndicatorProps) => {
  const { t } = useTranslation('common')

  const { className } = props

  return <DyoIcon className={className} imageClassName="animate-spin" src="/loading.svg" alt={t('loading')} size="md" />
}

export default LoadingIndicator
