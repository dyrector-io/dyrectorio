import { DyoCard } from '@app/elements/dyo-card'
import { DyoLabel } from '@app/elements/dyo-label'
import LoadingIndicator from '@app/elements/loading-indicator'
import { roleToText, selectedTeamOf, UserMeta } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import React, { useState } from 'react'
import TeamSelectionCard from './team-selection-card'

interface TopbarProps {
  className?: string
  meta?: UserMeta
}

const Topbar = (props: TopbarProps) => {
  const { t } = useTranslation('common')

  const { meta, className } = props

  const user = meta?.user

  const [teamSelectionVisible, setTeamSelectionVisible] = useState(false)

  const toggleTeamSelection = () => setTeamSelectionVisible(!teamSelectionVisible)

  return (
    <>
      <DyoCard className={clsx(className, 'flex flex-row justify-end relative p-4')}>
        {!user ? (
          <LoadingIndicator />
        ) : (
          <>
            <div className="flex flex-col items-end cursor-pointer mr-4" onClick={toggleTeamSelection}>
              <DyoLabel className="cursor-pointer">{user.name}</DyoLabel>
              <DyoLabel className="text-sm cursor-pointer">{`${t(roleToText(user.role))} @ ${
                selectedTeamOf(meta)?.name
              }`}</DyoLabel>
            </div>

            <Image
              className="cursor-pointer"
              src="/default_avatar.svg"
              alt={t('teamAvatar')}
              width={38}
              height={38}
              onClick={toggleTeamSelection}
            />

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
    </>
  )
}

export default Topbar
