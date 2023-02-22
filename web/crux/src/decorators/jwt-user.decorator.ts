import { createParamDecorator, ExecutionContext } from '@nestjs/common'

const JWTUser = createParamDecorator((_: unknown, context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest()
  return req.user.data.sub
})

export default JWTUser
