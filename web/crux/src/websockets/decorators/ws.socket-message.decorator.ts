import { PipeTransform, Type } from '@nestjs/common'
import { MessageBody } from '@nestjs/websockets'

const SocketMessage = (...pipes: (Type<PipeTransform> | PipeTransform)[]) => MessageBody('data', ...pipes)

export default SocketMessage
