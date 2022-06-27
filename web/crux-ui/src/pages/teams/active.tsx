import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { ListPageMenu, ListPageMenuTexts } from '@app/components/shared/page-menu'
import InviteUserCard from '@app/components/team/invite-user-card'
import UserStatusTag from '@app/components/team/user-status-tag'
import { DyoButton } from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoList } from '@app/elements/dyo-list'
import { DyoConfirmationModal } from '@app/elements/dyo-modal'
import { defaultApiErrorHandler } from '@app/errors'
import useConfirmation from '@app/hooks/use-confirmation'
import { roleToText, Team, User, userCanEditTeam } from '@app/models'
import { API_TEAMS_ACTIVE, ROUTE_INDEX, ROUTE_REGISTRIES, teamsActiveUserApiUrl } from '@app/routes'
import { redirectTo, withContextAuthorization } from '@app/utils'
import { Identity } from '@ory/kratos-client'
import { cruxFromContext } from '@server/crux/crux'
import { sessionOfContext } from '@server/kratos'
import clsx from 'clsx'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { useRef, useState } from 'react'

interface ActiveTeamPageProps {
  me: Identity
  team: Team
}

const ActiveTeamPage = (props: ActiveTeamPageProps) => {
  const { t } = useTranslation('teams')

  const router = useRouter()

  const { me, team } = props

  const canEdit = userCanEditTeam(me, team)

  const [users, setUsers] = useState(team.users)
  const [inviting, setInviting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState('')
  const [deleteModalConfig, confirmDelete] = useConfirmation()

  const submitRef = useRef<() => Promise<any>>()

  const handleApiError = defaultApiErrorHandler(t)

  const sendDeleteUserRequest = async (user: User) => {
    const res = await fetch(teamsActiveUserApiUrl(user.id), {
      method: 'DELETE',
    })

    if (res.ok) {
      setUsers(users.filter(it => it.id !== user.id))
    } else {
      handleApiError(res)
    }
  }

  const sendDeleteTeamRequest = async () => {
    const res = await fetch(API_TEAMS_ACTIVE, {
      method: 'DELETE',
    })

    if (res.ok) {
      router.replace(ROUTE_INDEX)
    } else {
      handleApiError(res)
    }
  }

  const onInvited = (user: User) => {
    setInviting(false)
    setUsers([...users, user])
  }

  const onDeleteUser = (user: User) => {
    setDeleteTarget(user.name)
    confirmDelete(
      () => sendDeleteUserRequest(user),
      () => setDeleteTarget(''),
    )
  }

  const onDeleteTeam = () => {
    setDeleteTarget(team.name)
    confirmDelete(sendDeleteTeamRequest, () => setDeleteTarget(''))
  }

  const selfLink: BreadcrumbLink = {
    name: t('common:team'),
    url: ROUTE_REGISTRIES,
  }

  const listHeaders = [...['common:name', 'common:email', 'role', 'common:status'].map(it => t(it)), '']
  const defaultHeaderClass = 'uppercase text-bright text-sm font-bold bg-medium-eased pl-2 py-3 h-11'
  const headerClassNames = [
    clsx(defaultHeaderClass, 'rounded-tl-lg pl-16'),
    ...Array.from({ length: listHeaders.length - 2 }).map(() => defaultHeaderClass),
    clsx(defaultHeaderClass, 'rounded-tr-lg pr-16'),
  ]

  const pageMenuTexts: ListPageMenuTexts = {
    add: t('invite'),
    save: t('send'),
  }

  return (
    <Layout>
      <PageHeading pageLink={selfLink}>
        {!canEdit ? null : (
          <>
            <ListPageMenu texts={pageMenuTexts} creating={inviting} setCreating={setInviting} submitRef={submitRef} />

            {inviting ? null : (
              <DyoButton className="ml-4 px-4" color="bg-error-red" onClick={() => onDeleteTeam()}>
                {t('common:delete')}
              </DyoButton>
            )}
          </>
        )}
      </PageHeading>

      {!inviting ? null : (
        <InviteUserCard className="mb-8 px-8 py-6" team={team} submitRef={submitRef} onUserInvited={onInvited} />
      )}

      <DyoCard className="relative">
        <DyoList
          className=""
          noSeparator
          headerClassName={headerClassNames}
          headers={listHeaders}
          data={users}
          itemBuilder={it => {
            /* eslint-disable react/jsx-key */
            return [
              <div className="font-semibold ml-14 py-1 h-8">{it.name}</div>,
              <div>{it.email}</div>,
              <div>{t(roleToText(it.role))}</div>,
              <UserStatusTag className="my-auto" status={it.status} />,
              inviting || !canEdit || it.role === 'owner' ? null : (
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
      </DyoCard>

      <DyoConfirmationModal
        config={deleteModalConfig}
        title={t('common:confirmDelete', { name: deleteTarget })}
        confirmText={t('common:delete')}
        className="w-1/4"
        confirmColor="bg-error-red"
      />
    </Layout>
  )
}

export default ActiveTeamPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const team = await cruxFromContext(context).teams.getActiveTeam()
  if (!team) {
    return redirectTo(ROUTE_INDEX)
  }

  return {
    props: {
      me: sessionOfContext(context).identity,
      team,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
