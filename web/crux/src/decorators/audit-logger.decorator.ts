import { SetMetadata } from '@nestjs/common'

export const AUDIT_LOGGER_LEVEL = 'audit-logger-level'
export type AuditLogLevelOption = 'disabled' | 'no-data' | 'all'

/**
 * AuditLogLevel decorator to tweak or disable the audit log
 *
 * @param level
 * @returns CustomDecorator
 */
export const AuditLogLevel = (level?: AuditLogLevelOption) => SetMetadata(AUDIT_LOGGER_LEVEL, level)
