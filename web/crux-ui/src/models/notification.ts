export const NOTIFICATION_TYPE_VALUES = ['discord', 'slack', 'teams', 'rocket', 'mattermost'] as const

export type NotificationType = (typeof NOTIFICATION_TYPE_VALUES)[number]

export const NOTIFICATION_EVENT_VALUES = [
  'deployment-status',
  'version-created',
  'node-added',
  'user-invited',
  'image-pushed',
  'image-pulled',
] as const
export type NotificationEventType = (typeof NOTIFICATION_EVENT_VALUES)[number]

export type Notification = {
  id: string
  name: string
  url: string
  type: NotificationType
  active: boolean
}

export type NotificationDetails = Notification & {
  enabledEvents: NotificationEventType[]
}

export type CreateNotification = {
  name: string
  url: string
  type: NotificationType
  active: boolean
  enabledEvents: NotificationEventType[]
}

export type UpdateNotification = CreateNotification

export const notificationEventTypeToLabel = (eventType: NotificationEventType): string => {
  switch (eventType) {
    case 'deployment-status':
      return 'deploymentStatus'
    case 'node-added':
      return 'nodeAdded'
    case 'user-invited':
      return 'userInvited'
    case 'version-created':
      return 'versionCreated'
    case 'image-pushed':
      return 'imagePushed'
    case 'image-pulled':
      return 'imagePulled'
    default:
      throw new Error(`Invalid notification event type ${eventType}`)
  }
}
