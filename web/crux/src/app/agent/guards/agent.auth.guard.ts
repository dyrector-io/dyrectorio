import { Metadata } from '@grpc/grpc-js'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { GrpcNodeConnection, NodeUnaryCall } from 'src/shared/grpc-node-connection'

@Injectable()
export class AgentAuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metadata = context.getArgByIndex<Metadata>(1)
    const call = context.getArgByIndex<NodeUnaryCall>(2)

    const connection = new GrpcNodeConnection(metadata, call)
    return connection.verify(this.jwt)
  }
}
