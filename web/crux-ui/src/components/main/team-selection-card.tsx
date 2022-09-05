import { DyoCard } from '@app/elements/dyo-card'
import { DyoList } from '@app/elements/dyo-list'
import { defaultApiErrorHandler } from '@app/errors'
import { SelectTeam, UserMeta, UserMetaTeam } from '@app/models'
import { API_TEAMS_ACTIVE, ROUTE_INDEX } from '@app/routes'
import { sendForm } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { useRouter } from 'next/router'

interface TeamSelectionCardProps {
  className?: string
  meta: UserMeta
  onTeamSelected?: (team: UserMetaTeam) => void
}

const TeamSelectionCard = (props: TeamSelectionCardProps) => {
  const { meta, className, onTeamSelected } = props

  const { t } = useTranslation('common')

  const router = useRouter()

  const handleApiError = defaultApiErrorHandler(t)

  const onSelectTeam = async (team: UserMetaTeam) => {
    const dto: SelectTeam = {
      id: team.id,
    }

    const res = await sendForm('POST', API_TEAMS_ACTIVE, dto)

    if (res.ok) {
      router.replace(ROUTE_INDEX)
      router.reload()
      onTeamSelected?.call(null)
    } else {
      handleApiError(res)
    }
  }

  const itemTemplate = (user: UserMetaTeam) => {
    const currentTeam = meta.activeTeamId === user.id

    /* eslint-disable react/jsx-key */
    return [
      <div
        className={clsx('flex flex-row items-center', currentTeam ? null : 'cursor-pointer')}
        onClick={currentTeam ? null : () => onSelectTeam(user)}
      >
        <Image
          className={currentTeam ? null : 'opacity-30 bg-blend-darken'}
          src="/default_team_avatar.svg"
          alt={t('teamAvatar')}
          width={32}
          height={32}
        />
        <div className="ml-4">{user.name}</div>
      </div>,
    ]
    /* eslint-enable react/jsx-key */
  }

  return (
    <DyoCard className={className}>
      <DyoList
        headerClassName="flex text-bright text-xl px-10 pr-32 my-4"
        itemClassName="flex text-bright pl-10 py-4"
        headers={[t('yourTeams')]}
        data={meta.teams}
        itemBuilder={it => itemTemplate(it)}
      />
    </DyoCard>
  )
}

export default TeamSelectionCard
