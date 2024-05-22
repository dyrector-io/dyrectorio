import { DyoCard } from '@app/elements/dyo-card'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { UserMeta, UserMetaTeam } from '@app/models'
import { ROUTE_DOCS, ROUTE_LOGOUT, ROUTE_PROFILE, ROUTE_TEAMS, TeamRoutes } from '@app/routes'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import NavButton from './nav-button'

interface TeamSelectionCardProps {
  className?: string
  meta: UserMeta
  onTeamSelected: (team: UserMetaTeam) => void
}

const menuItemsOf = (routes: TeamRoutes) => [
  {
    icon: '/audit.svg',
    text: 'audit',
    link: routes.audit.list(),
  },
  {
    icon: '/team.svg',
    text: 'teams',
    link: ROUTE_TEAMS,
  },
  {
    icon: '/documentation.svg',
    text: 'documentation',
    link: ROUTE_DOCS,
    target: '_blank',
  },
  {
    icon: '/logout.svg',
    text: 'logout',
    link: ROUTE_LOGOUT,
  },
]

const ProfileCard = (props: TeamSelectionCardProps) => {
  const { meta, className, onTeamSelected } = props

  const { t } = useTranslation('common')
  const routes = useTeamRoutes()

  const teamRoutes = useTeamRoutes()
  const menuitems = menuItemsOf(teamRoutes)

  return (
    <DyoCard className={clsx(className, 'px-4 py-2 gap-4 text-bright')}>
      <div className="flex flex-row border-b-2 border-light-grey">
        <NavButton className="m-2" href={ROUTE_PROFILE} icon="/profile.svg" text={t('profile')} />
      </div>

      <p className="text-light px-2 text-sm tracking-widest">{t('yourTeams').toUpperCase()}</p>

      {meta.teams.map(team => {
        const currentTeam = team.slug === routes?.teamSlug

        return (
          <div
            key={`team-${team.slug}`}
            className={clsx('flex flex-row items-center mx-6', currentTeam ? null : 'cursor-pointer')}
            onClick={currentTeam ? null : () => onTeamSelected(team)}
          >
            <Image
              className={currentTeam ? null : 'opacity-30 bg-blend-darken'}
              src="/default_team_avatar.svg"
              alt={t('teamAvatar')}
              width={32}
              height={32}
            />

            <div className="ml-4">{team.name}</div>
          </div>
        )
      })}

      <div className="flex flex-col border-t-2 border-light-grey">
        {menuitems.map(it => (
          <div key={it.link} className="flex flex-row">
            <NavButton className="m-2" href={it.link} icon={it.icon} text={t(it.text)} />
          </div>
        ))}
      </div>
    </DyoCard>
  )
}

export default ProfileCard
