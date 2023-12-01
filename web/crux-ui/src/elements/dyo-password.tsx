import React from 'react'
import DyoIcon from './dyo-icon'
import useTranslation from 'next-translate/useTranslation'

export type PasswordIconProps = {
  onClick: VoidFunction
  isVisible: boolean
}

const DyoPassword = (props: PasswordIconProps) => {
  const { onClick, isVisible } = props
  const { t } = useTranslation('common')

  return (
    <DyoIcon
      src={isVisible ? `/eye_close.svg` : '/eye.svg'}
      alt={isVisible ? t(`hidePassword`) : t('showPassword')}
      size="md"
      onClick={onClick}
    />
  )
}

export default DyoPassword
