import { DyoConfirmationModal } from '@app/elements/dyo-modal'
import LoadingIndicator from '@app/elements/loading-indicator'
import { defaultApiErrorHandler } from '@app/errors'
import useConfirmation from '@app/hooks/use-confirmation'
import { User, UserRole } from '@app/models'
import { userRoleApiUrl } from '@app/routes'
import { sendForm } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { useState } from 'react'

interface UserRoleActionProps {
  className?: string
  teamId: string
  user: User
  onRoleUpdated: (role: UserRole) => void
}

const UserRoleAction = (props: UserRoleActionProps) => {
  const { t } = useTranslation('teams')

  const { user } = props
  const role = user.role

  const [updating, setUpdating] = useState(false)
  const [roleUpdateModalConfig, confirmRoleUpdate] = useConfirmation()

  const handleApiError = defaultApiErrorHandler(t)

  const onUpdateUserRole = (role: UserRole, promote: boolean) =>
    confirmRoleUpdate(
      async () => {
        setUpdating(true)

        const res = await sendForm('PUT', userRoleApiUrl(props.teamId, user.id), role)
        if (res.ok) {
          props.onRoleUpdated(role)
        } else {
          handleApiError(res)
        }

        setUpdating(false)
      },
      {
        description: t('confirmRoleAction', {
          action: t(promote ? 'promote' : 'demote'),
          user: user.name !== '' ? user.name : user.email,
          role: t(`common:role.${role}`),
        }),
      },
    )

  return (
    <div className={props.className}>
      {updating ? (
        <LoadingIndicator />
      ) : role === 'admin' ? (
        <Image
          src="/arrow_down.svg"
          alt={t('demote')}
          width={16}
          height={16}
          onClick={() => onUpdateUserRole('user', false)}
        />
      ) : role === 'user' ? (
        <Image
          src="/arrow_up.svg"
          alt={t('promote')}
          width={16}
          height={16}
          onClick={() => onUpdateUserRole('admin', true)}
        />
      ) : null}

      <DyoConfirmationModal
        config={roleUpdateModalConfig}
        title={t('common:areYouSure')}
        className="w-1/4"
        confirmColor="bg-error-red"
      />
    </div>
  )
}

export default UserRoleAction
