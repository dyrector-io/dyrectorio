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
      className={clsx('bg-dyo-light-turquoise rounded-full w-9 h-9', onClick ? 'cursor-pointer' : null, className)}
      src="/user-avatar.svg"
      alt={t('userAvatar')}
      width={36}
      height={36}
      onClick={onClick}
    />
  )
}

export default UserDefaultAvatar
