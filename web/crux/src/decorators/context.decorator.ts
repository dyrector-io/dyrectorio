import { ExecutionContext, createParamDecorator } from '@nestjs/common'

// eslint-disable-next-line import/prefer-default-export
export const Context = createParamDecorator((_: unknown, context: ExecutionContext): ExecutionContext => context)
