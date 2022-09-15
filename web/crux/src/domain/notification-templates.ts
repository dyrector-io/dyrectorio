import { NotificationTypeEnum } from '@prisma/client'
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

const getNodeMessage = (args: BaseMessage): string => `${args.owner} added a new node: ${args.subject}!`

const getVersionMessage = (args: VersionMessage): string =>
  `${args.owner} created a new version: ${args.version} for product ${args.subject}!`

const getInviteMessage = (args: InviteMessage): string =>
  `${args.subject} has been invited to join team ${args.team} by ${args.owner} !`

const getFailedDeployMessage = (args: DeployMessage): string =>
  `Failed to deploy ${args.subject} version ${args.version} on node ${args.node}, initiated by: ${args.owner}!`

const getSuccessfulDeployMessage = (args: DeployMessage): string =>
  `${args.owner} successfully deployed ${args.subject} version ${args.version} on node ${args.node}!`

const getMessage = (messageType: NotificationMessageType): ((message: Message) => string) => {
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
    default:
      throw new InternalException({
        message: 'Not supported notification type',
      })
  }
}

const getDiscordTemplate = (template: NotificationTemplate): any => ({
  embeds: [
    {
      title,
      description: getMessage(template.messageType)(template.message),
      color: '1555130',
      timestamp: new Date(),
    },
  ],
})

const getSlackTemplate = (template: NotificationTemplate): any => ({
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
})

const getTeamsTemplate = (template: NotificationTemplate): any => ({
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
})

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
