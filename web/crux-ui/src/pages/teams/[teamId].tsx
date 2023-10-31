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
import { DyoConfirmationModal } from '@app/elements/dyo-modal'
import DyoTable, { DyoColumn, sortDate, sortEnum, sortString } from '@app/elements/dyo-table'
import { defaultApiErrorHandler } from '@app/errors'
import useConfirmation from '@app/hooks/use-confirmation'
import useSubmit from '@app/hooks/use-submit'
import useTeamRoutes from '@app/hooks/use-team-routes'
import useTimer from '@app/hooks/use-timer'
import {
  Team,
  TeamDetails,
  USER_ROLE_VALUES,
  USER_STATUS_VALUES,
  User,
  UserRole,
  roleToText,
  userIsAdmin,
  userIsOwner,
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
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { QA_DIALOG_LABEL_DELETE_USER, QA_DIALOG_LABEL_LEAVE_TEAM } from 'quality-assurance'
import { useState } from 'react'
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

  const submit = useSubmit()

  const handleApiError = defaultApiErrorHandler(t)

  const sendDeleteUserRequest = async (user: User): Promise<void> => {
    const res = await fetch(teamUserApiUrl(team.id, user.id), {
      method: 'DELETE',
    })

    if (res.ok) {
      setTeam({
        ...team,
        users: team.users.filter(it => it.id !== user.id),
      })
    } else {
      await handleApiError(res)
    }
  }

  const sendLeaveUserRequest = async (): Promise<void> => {
    const res = await fetch(teamUserLeaveApiUrl(team.id), {
      method: 'DELETE',
    })

    if (!res.ok) {
      await handleApiError(res)
      return
    }

    if (!activeTeam) {
      return
    }

    await router.replace(ROUTE_INDEX)
  }

  const onTeamEdited = async (newTeam: Team): Promise<void> => {
    setDetailsState('none')

    if (activeTeam) {
      await router.replace(selectTeamUrl(newTeam.slug))
      return
    }

    setTeam({
      ...team,
      ...newTeam,
    })

    await mutate(API_USERS_ME)
  }

  const onDeleteTeam = async (): Promise<void> => {
    const res = await fetch(teamApiUrl(team.id), {
      method: 'DELETE',
    })

    if (!res.ok) {
      await handleApiError(res)
      return
    }

    if (!activeTeam) {
      await router.replace(ROUTE_TEAMS)
      return
    }

    await router.replace(ROUTE_INDEX)
  }

  const onInviteUser = () => setDetailsState('inviting')

  const onReinviteUser = async (user: User): Promise<void> => {
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
      await handleApiError(res)
    }
  }

  const onUserInvited = (user: User) => {
    setDetailsState('none')
    setTeam({
      ...team,
      users: [...team.users, user],
    })
  }

  const onDeleteUser = async (user: User): Promise<void> => {
    const confirmed = await confirmDelete({
      qaLabel: QA_DIALOG_LABEL_DELETE_USER,
      title: t('common:areYouSureDeleteName', { name: user.name }),
      confirmText: t('common:delete'),
      confirmColor: 'bg-error-red',
    })

    if (!confirmed) {
      return
    }

    await sendDeleteUserRequest(user)
  }

  const onUserRoleUpdated = (userId: string, role: UserRole): Promise<void> => {
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

  const onLeaveTeam = async (): Promise<void> => {
    const confirmed = await confirmDelete({
      qaLabel: QA_DIALOG_LABEL_LEAVE_TEAM,
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

  const pageMenuTexts: DetailsPageTexts = {
    addDetailsItem: t('invite'),
    save: detailsState === 'inviting' ? t('send') : null,
  }

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
            submit={submit}
            onAdd={canEdit ? onInviteUser : null}
          />
        )}
      </PageHeading>

      {detailsState === 'editing' ? (
        <EditTeamCard className="mb-8 px-8 py-6" team={team} submit={submit} onTeamEdited={onTeamEdited} />
      ) : detailsState === 'inviting' ? (
        <InviteUserCard
          className="mb-8 px-8 py-6"
          team={team}
          recaptchaSiteKey={recaptchaSiteKey}
          submit={submit}
          onUserInvited={onUserInvited}
        />
      ) : null}

      <DyoCard className="relative">
        <DyoTable data={team.users} dataKey="id" initialSortColumn={0} initialSortDirection="asc">
          <DyoColumn
            header={t('common:name')}
            field="name"
            className="w-2/12"
            bodyClassName="font-semibold"
            sortable
            sort={sortString}
          />
          <DyoColumn header={t('common:email')} field="email" className="w-3/12" sortable sort={sortString} />
          <DyoColumn
            header={t('role')}
            className="w-1/12"
            sortable
            sortField="role"
            sort={sortEnum(USER_ROLE_VALUES)}
            body={(it: User) => (
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
              </div>
            )}
          />
          <DyoColumn
            header={t('lastLogin')}
            className="w-2/12"
            sortable
            sortField="lastLogin"
            sort={sortDate}
            body={(it: User) => (
              <div suppressHydrationWarning>{it.lastLogin ? utcDateToLocale(it.lastLogin) : t('common:never')}</div>
            )}
          />
          <DyoColumn
            header={t('common:status')}
            className="text-center"
            sortable
            sortField="status"
            sort={sortEnum(USER_STATUS_VALUES)}
            body={(it: User) => <UserStatusTag className="w-fit mx-auto" status={it.status} />}
          />
          <DyoColumn
            header={t('common:actions')}
            className="w-40 text-center"
            body={(it: User) => (
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
              </>
            )}
          />
        </DyoTable>
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
