import { UseGuards, UseInterceptors, UseFilters, ExceptionFilter, CanActivate, NestInterceptor } from '@nestjs/common'
import JwtAuthGuard from 'src/app/token/jwt-auth.guard'
import WsExceptionFilter from 'src/filters/ws.exception-filter'
import AuditLoggerInterceptor from 'src/interceptors/audit-logger.interceptor'

/* eslint-disable @typescript-eslint/ban-types */
export const UseGlobalWsFilters = (...filters: (ExceptionFilter | Function)[]) =>
  UseFilters(WsExceptionFilter, ...filters)

/* eslint-disable @typescript-eslint/ban-types */
export const UseGlobalWsGuards = (...guards: (CanActivate | Function)[]) => UseGuards(JwtAuthGuard, ...guards)

/* eslint-disable @typescript-eslint/ban-types */
export const UseGlobalWsInterceptors = (...interceptors: (NestInterceptor | Function)[]) =>
  UseInterceptors(AuditLoggerInterceptor, ...interceptors)
