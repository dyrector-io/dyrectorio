import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { DetailsPageMenu, DetailsPageTexts } from '@app/components/shared/page-menu'
import EditTeamCard from '@app/components/team/edit-team-card'
import InviteUserCard from '@app/components/team/invite-user-card'
import UserRoleAction from '@app/components/team/user-role-action'
import UserStatusTag from '@app/components/team/user-status-tag'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoList } from '@app/elements/dyo-list'
import { DyoConfirmationModal } from '@app/elements/dyo-modal'
import { defaultApiErrorHandler } from '@app/errors'
import useConfirmation from '@app/hooks/use-confirmation'
import { roleToText, Team, TeamDetails, User, userIsAdmin, userIsOwner, UserRole } from '@app/models'
import { ROUTE_TEAMS, teamApiUrl, teamUrl, userApiUrl } from '@app/routes'
import { redirectTo, withContextAuthorization } from '@app/utils'
import { Identity } from '@ory/kratos-client'
import { cruxFromContext } from '@server/crux/crux'
import { sessionOfContext } from '@server/kratos'
import clsx from 'clsx'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useRef, useState } from 'react'

interface TeamDetailsPageProps {
  me: Identity
  team: TeamDetails
}

const TeamDetailsPage = (props: TeamDetailsPageProps) => {
  const { t } = useTranslation('teams')

  const router = useRouter()

  const { me } = props

  const [team, setTeam] = useState(props.team)
  const [detailsState, setDetailsState] = useState<TeamDetailsState>('none')
  const [deleteModalConfig, confirmDelete] = useConfirmation()

  const actor = team.users.find(it => it.id === me.id)
  const canEdit = userIsAdmin(actor)
  const canDelete = userIsOwner(actor)

  const submitRef = useRef<() => Promise<any>>()

  const handleApiError = defaultApiErrorHandler(t)

  const sendDeleteUserRequest = async (user: User) => {
    const res = await fetch(userApiUrl(team.id, user.id), {
      method: 'DELETE',
    })

    if (res.ok) {
      setTeam({
        ...team,
        users: team.users.filter(it => it.id !== user.id),
      })
    } else {
      handleApiError(res)
    }
  }

  const onTeamEdited = (newTeam: Team) => {
    setDetailsState('none')
    setTeam({
      ...team,
      ...newTeam,
    })
  }

  const onDeleteTeam = async () => {
    const res = await fetch(teamApiUrl(team.id), {
      method: 'DELETE',
    })

    if (res.ok) {
      router.replace(ROUTE_TEAMS)
    } else {
      handleApiError(res)
    }
  }

  const onInviteUser = () => setDetailsState('inviting')

  const onUserInvited = (user: User) => {
    setDetailsState('none')
    setTeam({
      ...team,
      users: [...team.users, user],
    })
  }

  const onDeleteUser = (user: User) =>
    confirmDelete(() => sendDeleteUserRequest(user), {
      title: t('common:confirmDelete', { name: user.name }),
    })

  const onUserRoleUpdated = (userId: string, role: UserRole) => {
    const index = team.users.findIndex(it => it.id === userId)
    if (index < 0) {
      return
    }

    const newUsers = [...team.users]
    newUsers[index].role = role
    setTeam({
      ...team,
      users: newUsers,
    })
  }

  const selfLink: BreadcrumbLink = {
    name: t('common:teams'),
    url: ROUTE_TEAMS,
  }

  const sublinks: BreadcrumbLink[] = [
    {
      name: team.name,
      url: teamUrl(team.id),
    },
  ]

  const listHeaders = [...['common:name', 'common:email', 'role', 'lastLogin', 'common:status'].map(it => t(it)), '']
  const defaultHeaderClass = 'uppercase text-bright text-sm font-bold bg-medium-eased pl-2 py-3 h-11'
  const headerClassNames = [
    clsx(defaultHeaderClass, 'rounded-tl-lg pl-16'),
    ...Array.from({ length: listHeaders.length - 2 }).map(() => defaultHeaderClass),
    clsx(defaultHeaderClass, 'rounded-tr-lg pr-16'),
  ]

  const pageMenuTexts: DetailsPageTexts = {
    addDetailsItem: t('invite'),
    save: detailsState === 'inviting' ? t('send') : null,
  }

  return (
    <Layout title={t('teamsName', team)}>
      <PageHeading pageLink={selfLink} sublinks={sublinks}>
        {!canEdit ? null : (
          <DetailsPageMenu
            texts={pageMenuTexts}
            editing={detailsState !== 'none'}
            setEditing={it => setDetailsState(it ? 'editing' : 'none')}
            deleteModalTitle={t('common:confirmDelete', { name: team.name })}
            onDelete={canDelete ? onDeleteTeam : null}
            submitRef={submitRef}
            onAdd={canEdit ? onInviteUser : null}
          />
        )}
      </PageHeading>

      {detailsState === 'editing' ? (
        <EditTeamCard className="mb-8 px-8 py-6" team={team} submitRef={submitRef} onTeamEdited={onTeamEdited} />
      ) : detailsState === 'inviting' ? (
        <InviteUserCard className="mb-8 px-8 py-6" team={team} submitRef={submitRef} onUserInvited={onUserInvited} />
      ) : null}

      <DyoCard className="relative">
        <DyoList
          className=""
          noSeparator
          headerClassName={headerClassNames}
          headers={listHeaders}
          data={team.users}
          itemBuilder={it => {
            /* eslint-disable react/jsx-key */
            return [
              <div className="font-semibold ml-14 py-1 h-8">{it.name}</div>,
              <div>{it.email}</div>,
              <div className="flex flex-row">
                <span>{t(roleToText(it.role))}</span>
                {!canEdit || it.status !== 'verified' ? null : (
                  <UserRoleAction
                    className="flex ml-2"
                    teamId={team.id}
                    user={it}
                    onRoleUpdated={role => onUserRoleUpdated(it.id, role)}
                  />
                )}
              </div>,
              <div>{ it.lastLogin }</div>,
              <UserStatusTag className="my-auto w-fit" status={it.status} />,
              detailsState !== 'none' || !canEdit || it.role === 'owner' ? null : (
                <Image
                  className="cursor-pointer mr-16"
                  src="/trash-can.svg"
                  alt={t('common:delete')}
                  width={24}
                  height={24}
                  onClick={() => onDeleteUser(it)}
                />
              ),
            ]
            /* eslint-enable react/jsx-key */
          }}
        />

        <DyoConfirmationModal
          config={deleteModalConfig}
          title={t('common:confirmDelete')}
          confirmText={t('common:delete')}
          className="w-1/4"
          confirmColor="bg-error-red"
        />
      </DyoCard>
    </Layout>
  )
}

export default TeamDetailsPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const teamId = context.query.teamId as string

  const team = await cruxFromContext(context).teams.getTeamById(teamId)
  if (!team) {
    return redirectTo(ROUTE_TEAMS)
  }

  return {
    props: {
      me: sessionOfContext(context).identity,
      team,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)

type TeamDetailsState = 'none' | 'editing' | 'inviting'
