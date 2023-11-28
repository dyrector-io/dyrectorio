import { API_QUALITY_ASSURANCE } from '@app/routes'
import { getCruxFromContext } from '@server/crux-api'
import { GetServerSidePropsContext } from 'next'
import posthog from 'posthog-js'
import { ReactHTML } from 'react'

export const QA_URL = 'https://eu.posthog.com'
export const QA_GROUP_TYPE = 'dyoInstance'

export const QA_SETTINGS_PROP = 'qaSettings'
export type QASettings = {
  groupId: string
  groupName: string
}

export type QAGroupProperties = {
  name: string
}

export type QAElementType = keyof Pick<ReactHTML, 'a' | 'div' | 'button' | 'img' | 'select'>
export type QAElementEvent = {
  label: string
  elementType: QAElementType
}

const QA_EVENT_CLICK = 'click'
export const sendQAClickEvent = (event: QAElementEvent) => posthog.capture(QA_EVENT_CLICK, event)

const QA_EVENT_KEY = 'key'
export type QAKeyEvent = {
  label: string
  key: string
}

export const sendQAKeyEvent = (event: QAKeyEvent) => posthog.capture(QA_EVENT_KEY, event)

const QA_EVENT_CHECK = 'check'
const QA_EVENT_UNCHECK = 'uncheck'
export const sendQACheckEvent = (event: QAElementEvent, checked: boolean) =>
  posthog.capture(checked ? QA_EVENT_CHECK : QA_EVENT_UNCHECK, event)

const QA_EVENT_TOGGLE = 'toggle'
export const sendQAToggleEvent = (label: string) => {
  const event: QAElementEvent = {
    elementType: 'button',
    label,
  }

  posthog.capture(QA_EVENT_TOGGLE, event)
}

const QA_EVENT_SELECT_RADIO_BUTTON = 'select-radio-button'
export const sendQASelectRadioButtonEvent = (label: string) => {
  const event: QAElementEvent = {
    elementType: 'div',
    label,
  }

  posthog.capture(QA_EVENT_SELECT_RADIO_BUTTON, event)
}

const QA_EVENT_SELECT_CHIP = 'select-chip'
export const sendQASelectChipEvent = (label: string) => {
  const event: QAElementEvent = {
    elementType: 'button',
    label,
  }

  posthog.capture(QA_EVENT_SELECT_CHIP, event)
}

const QA_EVENT_SELECT_ICON = 'select-icon'
export const sendQASelectIconEvent = (icon: string) => {
  const event: QAElementEvent = {
    elementType: 'img',
    label: icon,
  }

  posthog.capture(QA_EVENT_SELECT_ICON, event)
}

const QA_EVENT_DIALOG = 'dialog'
type DialogEventType = 'open' | 'close'
export const sendQADialogEvent = (label: string, eventType: DialogEventType) => {
  const event: QAElementEvent = {
    elementType: 'div',
    label,
  }

  posthog.capture(`${QA_EVENT_DIALOG}-${eventType}`, event)
}

export const QA_DIALOG_LABEL_DELETE_CONFIG_BUNDLE = 'deleteConfigBundle'
export const QA_DIALOG_LABEL_REVOKE_NODE_TOKEN = 'revokeNodeToken'
export const QA_DIALOG_LABEL_KICK_AGENT = 'kickAgent'
export const QA_DIALOG_LABEL_DELETE_CONTAINER = 'deleteContainer'
export const QA_DIALOG_LABEL_SET_AS_DEFAULT = 'setAsDefault'
export const QA_DIALOG_LABEL_DEPLOY = 'deploy'
export const QA_DIALOG_LABEL_DELETE_DEPLOYMENT = 'deleteDeployment'
export const QA_DIALOG_LABEL_DELETE_IMAGE = 'deleteImage'
export const QA_DIALOG_LABEL_REVOKE_DEPLOY_TOKEN = 'revokeDeployToken'
export const QA_DIALOG_LABEL_DELETE_FROM_PAGE_MENU = 'deleteFromPageMenu'
export const QA_DIALOG_LABEL_CHANGE_TEAM_SLUG = 'changeTeamSlug'
export const QA_DIALOG_LABEL_LEAVE_TEAM = 'leaveTeam'
export const QA_DIALOG_LABEL_UPDATE_USER_ROLE = 'updateUserRole'
export const QA_DIALOG_LABEL_DEPLOY_PROTECTED = 'deployProtected'
export const QA_DIALOG_LABEL_HIDE_ONBOARDING = 'hideOnboarding'
export const QA_DIALOG_LABEL_CONVERT_PROJECT_TO_VERSIONED = ''
export const QA_DIALOG_LABEL_REMOVE_OIDC_ACCOUNT = 'removeOIDCAccount'
export const QA_DIALOG_LABEL_DELETE_USER_TOKEN = 'deleteUserToken'
export const QA_DIALOG_LABEL_DELETE_USER = 'deleteUser'

export const QA_MODAL_LABEL_NODE_AUDIT_DETAILS = 'nodeAuditDetails'
export const QA_MODAL_LABEL_DEPLOYMENT_NOTE = 'deploymentNote'
export const QA_MODAL_LABEL_IMAGE_TAGS = 'image-tags'
export const QA_MODAL_LABEL_AUDIT_LOG_DETAILS = 'auditLogDetails'

export const QA_LINK_LABEL = ''

export type QualityAssurance = {
  disabled: boolean
  group?: {
    id: string
    name: string
  }
}

type QAAwareHttpServer = {
  qa: QualityAssurance
}

export const fetchQualityAssuranceSettings = async (context: GetServerSidePropsContext): Promise<QASettings | null> => {
  const httpServer: QAAwareHttpServer = (context.req.socket as any).server
  if (!httpServer.qa) {
    httpServer.qa = await getCruxFromContext<QualityAssurance>(context, API_QUALITY_ASSURANCE)
  }

  const { qa } = httpServer

  if (!qa || !qa.group) {
    return null
  }

  const { id, name } = qa.group

  return {
    groupId: id,
    groupName: name,
  }
}
