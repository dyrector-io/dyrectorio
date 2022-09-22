export const NOTIFICATION_TYPE_VALUES = ['discord', 'slack', 'teams'] as const
export type NotificationType = typeof NOTIFICATION_TYPE_VALUES[number]

export const NOTIFICATION_EVENT_VALUES = [
  'deployment-created',
  'version-created',
  'node-added',
  'user-invited',
] as const
export type NotificationEventType = typeof NOTIFICATION_EVENT_VALUES[number]

export type CreateNotification = {
  name: string
  url: string
  type: NotificationType
  active: boolean
  events: NotificationEventType[]
}

export type UpdateNotification = CreateNotification & {
  id: string
}

export type NotificationDetails = CreateNotification & {
  id: string
  creator: string
}
