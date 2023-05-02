import { NotificationTypeEnum } from '@prisma/client'
import { CruxInternalServerErrorException } from 'src/exception/crux-exception'

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

export type DeployMessage = BaseMessage & {
  version: string
  node: string
}

export type Message = BaseMessage | VersionMessage | InviteMessage | DeployMessage

export type NotificationTemplate = {
  identityId: string
  messageType: NotificationMessageType
  message: Message
}

const getDiscordTemplate = (message: string): any => ({
  embeds: [
    {
      title,
      description: message,
      color: '1555130',
      timestamp: new Date(),
    },
  ],
})

const getSlackTemplate = (message: string): any => ({
  blocks: [
    {
      type: 'context',
      elements: [
        {
          type: 'plain_text',
          text: message,
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
})

const getTeamsTemplate = (message: string): any => ({
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
            text: message,
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
})

export const getTemplate = (notificationType: NotificationTypeEnum, message: string): any | null => {
  switch (notificationType) {
    case 'discord':
      return getDiscordTemplate(message)
    case 'slack':
      return getSlackTemplate(message)
    case 'teams':
      return getTeamsTemplate(message)
    default:
      throw new CruxInternalServerErrorException({
        message: 'Unsupported notification type',
        property: 'notificationType',
        value: notificationType,
      })
  }
}
