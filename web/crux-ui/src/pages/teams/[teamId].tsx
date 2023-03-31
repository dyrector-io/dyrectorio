import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { DetailsPageMenu, DetailsPageTexts } from '@app/components/shared/page-menu'
import EditTeamCard from '@app/components/team/edit-team-card'
import InviteUserCard from '@app/components/team/invite-user-card'
import UserRoleAction from '@app/components/team/user-role-action'
import UserStatusTag from '@app/components/team/user-status-tag'
import { AUTH_RESEND_DELAY } from '@app/const'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoList } from '@app/elements/dyo-list'
import { DyoConfirmationModal } from '@app/elements/dyo-modal'
import { defaultApiErrorHandler } from '@app/errors'
import useConfirmation from '@app/hooks/use-confirmation'
import useTimer from '@app/hooks/use-timer'
import {
  roleToText,
  Team,
  TeamDetails,
  User,
  userIsAdmin,
  userIsOwner,
  UserRole,
  userStatusReinvitable,
} from '@app/models'
import { API_USERS_ME, ROUTE_TEAMS, teamApiUrl, teamUrl, teamUserApiUrl, teamUserReinviteUrl } from '@app/routes'
import { redirectTo, utcDateToLocale, withContextAuthorization } from '@app/utils'
import { Identity } from '@ory/kratos-client'
import { getCruxFromContext } from '@server/crux-api'
import { sessionOfContext } from '@server/kratos'
import clsx from 'clsx'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useSWRConfig } from 'swr'

interface TeamDetailsPageProps {
  me: Identity
  team: TeamDetails
}

const TeamDetailsPage = (props: TeamDetailsPageProps) => {
  const { t } = useTranslation('teams')

  const router = useRouter()

  const { me, team: propsTeam } = props

  const { mutate } = useSWRConfig()

  const [countdown, startCountdown] = useTimer(-1)

  const [team, setTeam] = useState(propsTeam)
  const [detailsState, setDetailsState] = useState<TeamDetailsState>('none')
  const [deleteModalConfig, confirmDelete] = useConfirmation()

  const actor = team.users.find(it => it.id === me.id)
  const canEdit = userIsAdmin(actor)
  const canDelete = userIsOwner(actor)

  const submitRef = useRef<() => Promise<any>>()

  const handleApiError = defaultApiErrorHandler(t)

  const sendDeleteUserRequest = async (user: User) => {
    const res = await fetch(teamUserApiUrl(team.id, user.id), {
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
    mutate(API_USERS_ME)
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

  const onReinviteUser = async (user: User) => {
    startCountdown(AUTH_RESEND_DELAY)

    const res = await fetch(teamUserReinviteUrl(team.id, user.id), {
      method: 'POST',
    })

    if (res.ok) {
      const users = [...team.users]
      const index = users.indexOf(user)
      users[index] = {
        ...user,
        status: 'pending',
      }

      setTeam({
        ...team,
        users,
      })
    } else if (res.status === 412) {
      toast.error(t('invitationNotExpired'))
    } else {
      handleApiError(res)
    }
  }

  const onUserInvited = (user: User) => {
    setDetailsState('none')
    setTeam({
      ...team,
      users: [...team.users, user],
    })
  }

  const onDeleteUser = (user: User) =>
    confirmDelete(() => sendDeleteUserRequest(user), {
      title: t('common:areYouSureDeleteName', { name: user.name }),
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
  const defaultHeaderClass = 'h-11 uppercase text-bright text-sm bg-medium-eased py-3 pl-4 font-semibold'
  const headerClassNames = [
    clsx(defaultHeaderClass, 'rounded-tl-lg'),
    ...Array.from({ length: listHeaders.length - 3 }).map(() => defaultHeaderClass),
    clsx(defaultHeaderClass, 'text-center'),
    clsx(defaultHeaderClass, 'rounded-tr-lg'),
  ]

  const pageMenuTexts: DetailsPageTexts = {
    addDetailsItem: t('invite'),
    save: detailsState === 'inviting' ? t('send') : null,
  }

  /* eslint-disable react/jsx-key */
  const itemTemplate = (it: User) => [
    <div className="font-semibold py-1 h-8">{it.name}</div>,
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
    <div>{it.lastLogin ? utcDateToLocale(it.lastLogin) : t('never')}</div>,
    <UserStatusTag className="w-fit mx-auto" status={it.status} />,
    <div className="flex flex-row">
      {!userStatusReinvitable(it.status) || countdown > 0 ? null : (
        <div className="mr-2 inline-block">
          <Image
            className="aspect-square cursor-pointer"
            src="/restart.svg"
            alt={t('common:delete')}
            width={24}
            height={24}
            onClick={() => onReinviteUser(it)}
          />
        </div>
      )}

      {detailsState !== 'none' || !canEdit || it.role === 'owner' ? null : (
        <div className="mr-2 inline-block">
          <Image
            className="aspect-square cursor-pointer"
            src="/trash-can.svg"
            alt={t('common:delete')}
            width={24}
            height={24}
            onClick={() => onDeleteUser(it)}
          />
        </div>
      )}
    </div>,
  ]
  /* eslint-enable react/jsx-key */

  return (
    <Layout title={t('teamsName', team)}>
      <PageHeading pageLink={selfLink} sublinks={sublinks}>
        {!canEdit ? null : (
          <DetailsPageMenu
            texts={pageMenuTexts}
            editing={detailsState !== 'none'}
            setEditing={it => setDetailsState(it ? 'editing' : 'none')}
            deleteModalTitle={t('common:areYouSureDeleteName', { name: team.name })}
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
          headers={listHeaders}
          headerClassName={headerClassNames}
          itemClassName="h-11 min-h-min text-light-eased pl-4 w-fit"
          data={team.users}
          itemBuilder={itemTemplate}
        />

        <DyoConfirmationModal
          config={deleteModalConfig}
          title={t('common:areYouSureDeleteName')}
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

  const team = await getCruxFromContext<TeamDetails>(context, teamApiUrl(teamId))
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
