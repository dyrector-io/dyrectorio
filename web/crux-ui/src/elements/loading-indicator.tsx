import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'

interface LoadingIndicatorProps {
  className?: string
}

const LoadingIndicator = (props: LoadingIndicatorProps) => {
  const { t } = useTranslation('common')

  return (
    <div className={props.className}>
      <Image className="animate-spin" src="/loading.svg" alt={t('loading')} width={24} height={24} />
    </div>
  )
}

export default LoadingIndicator
