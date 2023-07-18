import { DyoCard } from '@app/elements/dyo-card'
import { DyoLabel } from '@app/elements/dyo-label'
import LoadingIndicator from '@app/elements/loading-indicator'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { activeTeamOf, roleToText, UserMeta } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'
import UserDefaultAvatar from '../team/user-default-avatar'
import TeamSelectionCard from './team-selection-card'

interface TopbarProps {
  className?: string
  meta?: UserMeta
  children?: React.ReactNode
}

const Topbar = (props: TopbarProps) => {
  const { t } = useTranslation('common')

  const { meta, className, children } = props

  const user = meta?.user
  const routes = useTeamRoutes()

  const activeTeam = activeTeamOf(meta, routes?.teamSlug)

  const [teamSelectionVisible, setTeamSelectionVisible] = useState(false)

  const toggleTeamSelection = () => setTeamSelectionVisible(!teamSelectionVisible)

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
                <TeamSelectionCard
                  className="flex flex-col flex-grow absolute top-0 right-0 mt-2 z-20"
                  meta={meta}
                  onTeamSelected={toggleTeamSelection}
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
