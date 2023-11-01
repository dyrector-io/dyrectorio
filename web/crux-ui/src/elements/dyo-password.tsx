import React from 'react'
import DyoIcon from './dyo-icon'
import useTranslation from 'next-translate/useTranslation'


export type passwordIconProps = {
    onClick : VoidFunction,
    isVisible : boolean
}

export const DyoPassword = ((props: passwordIconProps) => {
    const { onClick, isVisible } = props
    const { t } = useTranslation('common')
    
return (
    <>
     {
      <DyoIcon src={isVisible ? `/eye_close.svg` : '/eye.svg'} alt={isVisible ? t(`hidePassword`): t('showPassword')} size={'md'} onClick={onClick} />
     }
    </>
)})


