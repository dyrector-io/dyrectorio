import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'

const DyoSingleFormLogo = () => {
  const { t } = useTranslation('common')

  return (
    <div className="mx-auto mb-4">
      <Image src="/dyrector_io_logo_white.svg" alt={t('dyoWhiteLogo')} width={280} height={112} />
    </div>
  )
}

export default DyoSingleFormLogo
