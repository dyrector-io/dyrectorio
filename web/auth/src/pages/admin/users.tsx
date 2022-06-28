import { Identity } from '@ory/kratos-client'
import clsx from 'clsx'
import { useFormik } from 'formik'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import useSWR from 'swr'
import { DyoCard } from '@app/components/dyo-card'
import DyoImage from '@app/components/dyo-image'
import { DyoLabel } from '@app/components/dyo-label'
import { DyoList } from '@app/components/dyo-list'
import { FormCard } from '@app/components/form/form-card'
import { FormHeader } from '@app/components/form/form-header'
import {
  LabeledInput,
  labeledInputClassName,
} from '@app/components/form/labeled-input'
import InplaceConfirmation from '@app/components/inplace-confirmation'
import { Layout } from '@app/components/layout'
import { API_ADMIN_USERS, ROUTE_SETTINGS } from '@app/const'
import { DyoFetchError, InviteUserDto, UserInvitiedDto } from '@server/models'
import { fetcher, usernameToString, userVerified } from '@app/utils'
import { DyoButton } from '@app/components/dyo-button'

const UserListPage = () => {
  const { t } = useTranslation('admin/users')
  const router = useRouter()

  const { data, error } = useSWR<Identity[], DyoFetchError>(
    API_ADMIN_USERS,
    fetcher,
  )

  const [users, setUsers] = useState(data ?? [])
  const [inviting, setInviting] = useState(false)
  const [inviteLink, setInviteLink] = useState<string>(null)

  if (error) {
    if (error.status === 403) {
      router.replace(ROUTE_SETTINGS)
      return <></>
    }

    return (
      <DyoCard className="my-16 mx-auto">
        <DyoLabel>{t('errors:fetchFailed', { type: 'users' })}</DyoLabel>
      </DyoCard>
    )
  } else if (users.length < 1 && data) {
    setUsers(data ?? [])
  }

  const onUserInvited = (dto: UserInvitiedDto) => {
    const { identity, inviteUrl } = dto

    setUsers([...users, identity])
    setInviteLink(inviteUrl)
  }

  const onCopyLink = async link => {
    await navigator.clipboard.writeText(link)
    setInviteLink(null)
    setInviting(false)
    toast(t('common:copied'))
  }

  const onBack = () => {
    setInviteLink(null)
    setInviting(false)
  }

  const onDeleteUser = async (user: Identity) => {
    const res = await fetch(`${API_ADMIN_USERS}/${user.id}`, {
      method: 'DELETE',
    })

    if (res.ok) {
      setUsers(users.filter(it => it.id !== user.id))
    } else {
      const error = await res.json()

      toast(
        <DyoLabel className="font-red-300">
          {t('errors:deletionFailed', { type: 'users' })}
        </DyoLabel>,
      )
    }
  }

  return (
    <Layout>
      <div className="mx-8 mb-6">
        {inviting ? (
          <DyoButton onClick={() => onBack()}>{t('common:back')}</DyoButton>
        ) : (
          <DyoButton onClick={() => setInviting(true)}>{t('invite')}</DyoButton>
        )}
      </div>

      {!inviting ? (
        <DyoList
          className="max-w-full mx-2"
          headers={[
            t('common:name'),
            t('common:email'),
            t('verified'),
            t('common:delete'),
          ]}
          data={users}
          itemBuilder={(it: Identity) => [
            usernameToString(it),
            it.traits.email,
            userVerified(it) ? (
              <DyoImage src="/check.svg" width={24} height={24} />
            ) : (
              ''
            ),
            <InplaceConfirmation onConfirm={() => onDeleteUser(it)} />,
          ]}
        />
      ) : (
        <div className="grid grid-cols-2">
          {inviteLink ? (
            <DyoCard className="mx-auto mb-auto">
              <FormHeader element="h2" className="text-2xl">
                {t('invite')}
              </FormHeader>
              <DyoLabel>{t('userWasInvited')}</DyoLabel>
              <input
                className={clsx(labeledInputClassName, 'mt-4')}
                value={inviteLink}
              />
              <div className="flex flex-row justify-center mt-4">
                <DyoButton onClick={() => onCopyLink(inviteLink)}>
                  {t('common:copy')}
                </DyoButton>
              </div>
            </DyoCard>
          ) : (
            <UserInviteForm onSuccess={it => onUserInvited(it)} />
          )}

          <DyoList
            className="max-w-full mx-2"
            headers={[t('common:name'), t('common:email')]}
            data={users}
            itemBuilder={(it: Identity) => [
              usernameToString(it),
              it.traits.email,
            ]}
          />
        </div>
      )}
    </Layout>
  )
}

type UserInviteFormProps = {
  onSuccess: (user: UserInvitiedDto) => void
}

const UserInviteForm = (props: UserInviteFormProps) => {
  const { t } = useTranslation('admin/users')

  const [error, setError] = useState<string>(null)

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    onSubmit: async values => {
      const data: InviteUserDto = values

      const res = await fetch(API_ADMIN_USERS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        const dto = (await res.json()) as UserInvitiedDto
        props.onSuccess(dto)
      } else {
        setError(t('invitationFailed'))
      }
    },
  })

  return (
    <FormCard submitLabel={t(`invite`)} onSubmit={formik.handleSubmit}>
      <FormHeader element="h2" className="text-2xl">
        {t('inviteUser')}
      </FormHeader>

      <LabeledInput
        label={t('common:email')}
        name="email"
        type="email"
        onChange={formik.handleChange}
        value={formik.values.email}
        message={error}
        messageType="error"
      />
    </FormCard>
  )
}

export default UserListPage
