import { NotificationEventTypeEnum, NotificationTypeEnum } from '@prisma/client'
import { InternalException } from 'src/exception/errors'

const title = 'dyrector.io'

export type NotificationMessageType = 'node' | 'version' | 'invite' | 'failedDeploy' | 'successfulDeploy'

export type BaseMessage = {
  owner: string
  subject: string
}

export type VersionMessage = BaseMessage & {
  version: string
}

export type InviteMessage = BaseMessage & {
  team: string
}

export type Message = BaseMessage | VersionMessage | InviteMessage

export type NotificationTemplate = {
  identityId: string
  messageType: NotificationMessageType
  message: Message
}

export const getTemplate = (notificationType: NotificationTypeEnum, template: NotificationTemplate): any | null => {
  switch (notificationType) {
    case 'discord':
      return getDiscordTemplate(template)
    case 'slack':
      return getSlackTemplate(template)
    case 'teams':
      return getTeamsTemplate(template)
    default:
      throw new InternalException({
        message: 'Not supported message type',
      })
  }
}

const getDiscordTemplate = (template: NotificationTemplate): any => {
  return {
    embeds: [
      {
        title: title,
        description: getMessage(template.messageType)(template.message),
        color: '1555130',
        timestamp: new Date(),
      },
    ],
  }
}

const getSlackTemplate = (template: NotificationTemplate): any => {
  return {
    blocks: [
      {
        type: 'context',
        elements: [
          {
            type: 'plain_text',
            text: getMessage(template.messageType)(template.message),
          },
        ],
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: new Date().toUTCString(),
          },
        ],
      },
    ],
  }
}

const getTeamsTemplate = (template: NotificationTemplate): any => {
  return {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: {
          type: 'AdaptiveCard',
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          version: '1.3',
          body: [
            {
              type: 'TextBlock',
              text: title,
              wrap: true,
              size: 'large',
              weight: 'bolder',
            },
            {
              type: 'TextBlock',
              text: getMessage(template.messageType)(template.message),
              wrap: true,
              size: 'medium',
            },
            {
              type: 'TextBlock',
              text: new Date().toUTCString(),
              wrap: true,
              size: 'small',
              weight: 'lighter',
            },
          ],
        },
      },
    ],
  }
}

const getNodeMessage = (args: BaseMessage): string => {
  return `${args.owner} added a new node: ${args.subject}!`
}

const getVersionMessage = (args: VersionMessage): string => {
  return `${args.owner} created a new version: ${args.version} for product ${args.subject}!`
}

const getInviteMessage = (args: InviteMessage): string => {
  return `${args.subject} has been invited to join team ${args.team} by ${args.owner} !`
}

const getFailedDeployMessage = (args: BaseMessage): string => {
  return `Failed to deploy ${args.subject}, initiated by: ${args.owner}!`
}

const getSuccessfulDeployMessage = (args: BaseMessage): string => {
  return `${args.owner} successfully deployed ${args.subject}!`
}

const getMessage = (messageType: NotificationMessageType): ((arg: Message) => string) => {
  switch (messageType) {
    case 'node':
      return getNodeMessage
    case 'version':
      return getVersionMessage
    case 'invite':
      return getInviteMessage
    case 'failedDeploy':
      return getFailedDeployMessage
    case 'successfulDeploy':
      return getSuccessfulDeployMessage
  }
}

export const getMessageEventFromType = (messageType: NotificationMessageType): NotificationEventTypeEnum => {
  switch (messageType) {
    case 'node':
      return NotificationEventTypeEnum.node_added
    case 'version':
      return NotificationEventTypeEnum.version_created
    case 'invite':
      return NotificationEventTypeEnum.user_team_invited
    case 'failedDeploy':
      return NotificationEventTypeEnum.deployment_created
    case 'successfulDeploy':
      return NotificationEventTypeEnum.deployment_created
  }
}
