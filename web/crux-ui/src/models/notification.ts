export const NOTIFICATION_TYPE_VALUES = ['discord', 'slack', 'teams'] as const
export type NotificationType = typeof NOTIFICATION_TYPE_VALUES[number]

export const NOTIFICATION_EVENT_VALUES = [
  'deployment-created',
  'version-created',
  'node-added',
  'user-invited',
] as const
export type NotificationEventType = typeof NOTIFICATION_EVENT_VALUES[number]

export type Notification = {
  id: string
  name: string
  url: string
  type: NotificationType
  active: boolean
  creatorName: string
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
