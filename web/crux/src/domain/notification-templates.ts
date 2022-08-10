import { NotificationTypeEnum } from '@prisma/client'

const title = 'dyrector.io'

export type NotificationMessageType = 'node' | 'version' | 'invite' | 'failedDeploy' | 'successfullDeploy'

export type NotificationTemplate = {
  identityId: string
  messageType: NotificationMessageType
  args: string[]
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
      return null
  }
}

const getDiscordTemplate = (template: NotificationTemplate): any => {
  return {
    embeds: [
      {
        title: title,
        description: getMessage(template.messageType)(...template.args),
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
            text: getMessage(template.messageType)(...template.args),
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
              text: getMessage(template.messageType)(...template.args),
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

const getNodeMessage = (node: string, owner: string): string => {
  return `${owner} added a new node: ${node}!`
}

const getVersionMessage = (version: string, product: string, owner: string): string => {
  return `${owner} created a new version: ${version} for product ${product}!`
}

const getInviteMessage = (email: string, team: string, owner: string): string => {
  return `${email} has been invited to join team ${team} by ${owner} !`
}

const getFailedDeployMessage = (deployment: string, owner: string): string => {
  return `Failed to deploy ${deployment}, initiated by: ${owner}!`
}

const getSuccessfullDeployMessage = (deployment: string, owner: string): string => {
  return `${owner} successfully deployed ${deployment}!`
}

const getMessage = (messageType: NotificationMessageType): ((...args: string[]) => string) => {
  switch (messageType) {
    case 'node':
      return getNodeMessage
    case 'version':
      return getVersionMessage
    case 'invite':
      return getInviteMessage
    case 'failedDeploy':
      return getFailedDeployMessage
    case 'successfullDeploy':
      return getSuccessfullDeployMessage
  }
}
