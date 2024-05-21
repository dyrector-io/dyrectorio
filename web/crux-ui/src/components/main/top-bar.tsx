import { DyoCard } from '@app/elements/dyo-card'
import { DyoLabel } from '@app/elements/dyo-label'
import LoadingIndicator from '@app/elements/loading-indicator'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { activeTeamOf, roleToText, UserMeta, UserMetaTeam } from '@app/models'
import { selectTeamUrl } from '@app/routes'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useState } from 'react'
import UserDefaultAvatar from '../team/user-default-avatar'
import ProfileCard from './profile-card'

interface TopbarProps {
  className?: string
  meta?: UserMeta
  children?: React.ReactNode
}

const Topbar = (props: TopbarProps) => {
  const { meta, className, children } = props

  const { t } = useTranslation('common')

  const user = meta?.user
  const routes = useTeamRoutes()
  const router = useRouter()

  const activeTeam = activeTeamOf(meta, routes?.teamSlug)

  const [teamSelectionVisible, setTeamSelectionVisible] = useState(false)

  const toggleTeamSelection = () => setTeamSelectionVisible(!teamSelectionVisible)

  const onTeamSelected = async (team: UserMetaTeam) => {
    toggleTeamSelection()
    await router.push(selectTeamUrl(team.slug))
  }

  return (
    <DyoCard className={clsx(className, 'flex flex-row relative p-4')}>
      <div className="flex flex-grow">{children}</div>

      {!user ? (
        <LoadingIndicator className="ml-auto" />
      ) : (
        <>
          <div className="flex flex-col items-end cursor-pointer ml-auto mr-4" onClick={toggleTeamSelection}>
            <DyoLabel className="cursor-pointer">{user.name}</DyoLabel>

            {activeTeam && (
              <DyoLabel className="text-sm cursor-pointer">{`${t(roleToText(activeTeam.role))} @ ${
                activeTeam.name
              }`}</DyoLabel>
            )}
          </div>

          <UserDefaultAvatar className="my-auto" onClick={toggleTeamSelection} />

          {!teamSelectionVisible ? null : (
            <>
              <div className="w-full absolute bottom-0 right-0">
                <ProfileCard
                  className="flex flex-col absolute top-0 right-0 mt-2 z-20"
                  meta={meta}
                  onTeamSelected={onTeamSelected}
                />
              </div>

              <div className="w-full h-full fixed top-0 right-0 z-10" onClick={toggleTeamSelection} />
            </>
          )}
        </>
      )}
    </DyoCard>
  )
}

export default Topbar
