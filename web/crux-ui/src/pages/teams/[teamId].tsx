import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { DetailsPageMenu, DetailsPageTexts } from '@app/components/shared/page-menu'
import EditTeamCard from '@app/components/team/edit-team-card'
import InviteUserCard from '@app/components/team/invite-user-card'
import UserRoleAction from '@app/components/team/user-role-action'
import UserStatusTag from '@app/components/team/user-status-tag'
import { AUTH_RESEND_DELAY, COOKIE_TEAM_SLUG } from '@app/const'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoIcon from '@app/elements/dyo-icon'
import { DyoList } from '@app/elements/dyo-list'
import { DyoConfirmationModal } from '@app/elements/dyo-modal'
import { defaultApiErrorHandler } from '@app/errors'
import useConfirmation from '@app/hooks/use-confirmation'
import useTeamRoutes from '@app/hooks/use-team-routes'
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
import { appendTeamSlug } from '@app/providers/team-routes'
import {
  API_USERS_ME,
  ROUTE_INDEX,
  ROUTE_TEAMS,
  selectTeamUrl,
  teamApiUrl,
  teamUrl,
  teamUserApiUrl,
  teamUserLeaveApiUrl,
  teamUserReinviteUrl,
} from '@app/routes'
import { redirectTo, utcDateToLocale, withContextAuthorization } from '@app/utils'
import { Identity } from '@ory/kratos-client'
import { captchaDisabled } from '@server/captcha'
import { getCookie } from '@server/cookie'
import { getCruxFromContext } from '@server/crux-api'
import { sessionOfContext } from '@server/kratos'
import clsx from 'clsx'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useSWRConfig } from 'swr'

interface TeamDetailsPageProps {
  me: Identity
  team: TeamDetails
  recaptchaSiteKey?: string
}

const TeamDetailsPage = (props: TeamDetailsPageProps) => {
  const { me, team: propsTeam, recaptchaSiteKey } = props

  const { t } = useTranslation('teams')
  const routes = useTeamRoutes()

  const router = useRouter()

  const { mutate } = useSWRConfig()

  const [countdown, startCountdown] = useTimer(-1)

  const [team, setTeam] = useState(propsTeam)
  const [detailsState, setDetailsState] = useState<TeamDetailsState>('none')
  const [deleteModalConfig, confirmDelete] = useConfirmation()

  const activeTeam = team.slug === routes.teamSlug
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

  const sendLeaveUserRequest = async () => {
    const res = await fetch(teamUserLeaveApiUrl(team.id), {
      method: 'DELETE',
    })

    if (!res.ok) {
      handleApiError(res)
      return
    }

    if (!activeTeam) {
      return
    }

    await router.replace(ROUTE_INDEX)
  }

  const onTeamEdited = (newTeam: Team) => {
    setDetailsState('none')

    if (activeTeam) {
      router.replace(selectTeamUrl(newTeam.slug))
      return
    }

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

    if (!res.ok) {
      handleApiError(res)
      return
    }

    if (!activeTeam) {
      await router.replace(ROUTE_TEAMS)
      return
    }

    await router.replace(ROUTE_INDEX)
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

  const onDeleteUser = async (user: User) => {
    const confirmed = await confirmDelete({
      title: t('common:areYouSureDeleteName', { name: user.name }),
      confirmText: t('common:delete'),
      confirmColor: 'bg-error-red',
    })

    if (!confirmed) {
      return
    }

    await sendDeleteUserRequest(user)
  }

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

  const onLeaveTeam = async () => {
    const confirmed = await confirmDelete({
      title: t('leaveTeam'),
      description: t('areYouSureWantToLeave', { name: team.name }),
    })

    if (!confirmed) {
      return
    }

    await sendLeaveUserRequest()
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

  const listHeaders = [
    ...['common:name', 'common:email', 'role', 'lastLogin', 'common:status', 'common:actions'].map(it => t(it)),
  ]
  const defaultHeaderClass = 'h-11 uppercase text-bright text-sm bg-medium-eased px-2 py-3 font-semibold'
  const headerClassNames = [
    clsx(defaultHeaderClass, 'rounded-tl-lg pl-6'),
    ...Array.from({ length: listHeaders.length - 3 }).map(() => defaultHeaderClass),
    clsx(defaultHeaderClass, 'text-center'),
    clsx(defaultHeaderClass, 'rounded-tr-lg pr-6 text-center'),
  ]

  const defaultItemClass = 'h-11 min-h-min text-light-eased p-2 w-fit'
  const itemClass = [
    clsx('pl-6', defaultItemClass),
    ...Array.from({ length: listHeaders.length - 3 }).map(() => defaultItemClass),
    clsx('text-center', defaultItemClass),
    clsx('pr-6 text-center', defaultItemClass),
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
    <div>{it.lastLogin ? utcDateToLocale(it.lastLogin) : t('common:never')}</div>,
    <UserStatusTag className="w-fit mx-auto" status={it.status} />,
    <>
      {!userStatusReinvitable(it.status) || countdown > 0 ? null : (
        <div className="mr-2 inline-block">
          <DyoIcon
            className="aspect-square cursor-pointer"
            src="/restart.svg"
            alt={t('reinvite')}
            size="md"
            onClick={() => onReinviteUser(it)}
          />
        </div>
      )}

      {detailsState !== 'none' || !canEdit || it.role === 'owner' ? null : (
        <div className="inline-block">
          <DyoIcon
            className="aspect-square cursor-pointer"
            src="/trash-can.svg"
            alt={t('common:delete')}
            size="md"
            onClick={() => onDeleteUser(it)}
          />
        </div>
      )}
    </>,
  ]
  /* eslint-enable react/jsx-key */

  return (
    <Layout title={t('teamsName', team)}>
      <PageHeading pageLink={selfLink} sublinks={sublinks}>
        {!userIsOwner(actor) && (
          <DyoButton className="mx-2 px-6" color="bg-error-red" onClick={onLeaveTeam}>
            {t('leave')}
          </DyoButton>
        )}
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
        <InviteUserCard
          className="mb-8 px-8 py-6"
          team={team}
          recaptchaSiteKey={recaptchaSiteKey}
          submitRef={submitRef}
          onUserInvited={onUserInvited}
        />
      ) : null}

      <DyoCard className="relative">
        <DyoList
          className=""
          noSeparator
          headers={listHeaders}
          headerClassName={headerClassNames}
          itemClassName={itemClass}
          data={team.users}
          itemBuilder={itemTemplate}
        />

        <DyoConfirmationModal config={deleteModalConfig} className="w-1/4" />
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

  const teamSlug = getCookie(context, COOKIE_TEAM_SLUG) ?? team.slug

  return {
    props: appendTeamSlug(teamSlug, {
      me: sessionOfContext(context).identity,
      team,
      recaptchaSiteKey: captchaDisabled() ? null : process.env.RECAPTCHA_SITE_KEY,
    }),
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)

type TeamDetailsState = 'none' | 'editing' | 'inviting'
