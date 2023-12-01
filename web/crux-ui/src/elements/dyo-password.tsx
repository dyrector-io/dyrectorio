import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'
import DyoIcon from './dyo-icon'
import { DyoInput, DyoInputProps } from './dyo-input'

export type PasswordIconProps = Omit<DyoInputProps, 'type'> & {}

const DyoPassword = (props: PasswordIconProps) => {
  const { t } = useTranslation('common')

  const [hidden, setHidden] = useState(true)

  const onToggle = () => setHidden(!hidden)

  return (
    <DyoInput {...props} type={hidden ? 'password' : 'text'}>
      <DyoIcon
        className="flex absolute right-2 bottom-0 top-0"
        src={hidden ? `/eye.svg` : '/eye_close.svg'}
        alt={hidden ? t(`show`) : t('hide')}
        size="md"
        onClick={onToggle}
      />
    </DyoInput>
  )
}

export default DyoPassword
