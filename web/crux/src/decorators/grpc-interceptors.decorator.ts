import { UseInterceptors } from '@nestjs/common'
import AuditLoggerInterceptor from 'src/interceptors/audit-logger.interceptor'
import GrpcErrorInterceptor from 'src/interceptors/grpc.error.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'

const UseGrpcInterceptors = (): MethodDecorator & ClassDecorator =>
  UseInterceptors(GrpcErrorInterceptor, PrismaErrorInterceptor, AuditLoggerInterceptor)

export default UseGrpcInterceptors
