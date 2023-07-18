import { ExecutionContext, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { subscriptionOfContext } from 'src/websockets/decorators/ws.subscription.decorator'

export const AUDIT_LOGGER_LEVEL = 'audit-logger-level'
export type AuditLogLevelOptions = 'disabled' | 'no-data' | 'all'

/**
 * AuditLogLevel decorator to tweak or disable the audit log
 *
 * @param level
 * @returns CustomDecorator
 */
export const AuditLogLevel = (level: AuditLogLevelOptions) => SetMetadata(AUDIT_LOGGER_LEVEL, level)

export const AUDIT_LOGGER_TEAM_SLUG_PROVIDER = 'audit-logger-team-slug-provider'
export type AuditLogTeamSlugProvider = (context: ExecutionContext) => string

export const teamSlugProviderOfContext = (context: ExecutionContext, reflector: Reflector) =>
  reflector.get<AuditLogTeamSlugProvider>(AUDIT_LOGGER_TEAM_SLUG_PROVIDER, context.getHandler())

/**
 * AuditLogTeamSlug decorator to set a method of extracting
 * the team slug from an ExecutionContext
 *
 * @param level
 * @returns CustomDecorator
 */
export const AuditLogTeamSlug = (provider: AuditLogTeamSlugProvider) =>
  SetMetadata(AUDIT_LOGGER_TEAM_SLUG_PROVIDER, provider)

export const teamSlugFromHttpRequestParams: AuditLogTeamSlugProvider = (context: ExecutionContext) =>
  context.switchToHttp().getRequest().params.teamSlug as string

export const teamSlugFromWsContext: AuditLogTeamSlugProvider = (context: ExecutionContext) =>
  subscriptionOfContext(context).getParameter('teamSlug')
