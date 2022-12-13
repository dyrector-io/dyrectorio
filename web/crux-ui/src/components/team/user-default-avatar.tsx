import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'

interface UserDefaultAvatarProps {
  className?: string
  onClick?: VoidFunction
}

const UserDefaultAvatar = (props: UserDefaultAvatarProps) => {
  const { t } = useTranslation('common')
  const { className, onClick } = props

  return (
    <Image
      className={clsx('cursor-pointer bg-dyo-light-turquoise rounded-full w-9 h-9', className)}
      src="/default_avatar.svg"
      alt={t('teamAvatar')}
      width={36}
      height={36}
      onClick={onClick}
    />
  )
}

export default UserDefaultAvatar
