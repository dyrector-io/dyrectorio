import { DyoCard } from '@app/elements/dyo-card'
import { DyoList } from '@app/elements/dyo-list'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { UserMeta, UserMetaTeam } from '@app/models'
import { selectTeamUrl } from '@app/routes'
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
  const routes = useTeamRoutes()
  const router = useRouter()

  const onSelectTeam = async (team: UserMetaTeam) => {
    router.push(selectTeamUrl(team.slug))
    onTeamSelected?.call(null)
  }

  const itemTemplate = (team: UserMetaTeam) => {
    const currentTeam = team.slug === routes?.teamSlug

    /* eslint-disable react/jsx-key */
    return [
      <div
        className={clsx('flex flex-row items-center', currentTeam ? null : 'cursor-pointer')}
        onClick={currentTeam ? null : () => onSelectTeam(team)}
      >
        <Image
          className={currentTeam ? null : 'opacity-30 bg-blend-darken'}
          src="/default_team_avatar.svg"
          alt={t('teamAvatar')}
          width={32}
          height={32}
        />
        <div className="ml-4">{team.name}</div>
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
        itemBuilder={itemTemplate}
      />
    </DyoCard>
  )
}

export default TeamSelectionCard
