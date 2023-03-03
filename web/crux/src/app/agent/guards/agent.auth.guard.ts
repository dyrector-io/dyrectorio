import { Metadata } from '@grpc/grpc-js'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import GrpcNodeConnection, { NodeGrpcCall } from 'src/shared/grpc-node-connection'

@Injectable()
export default class AgentAuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metadata = context.getArgByIndex<Metadata>(1)
    const call = context.getArgByIndex<NodeGrpcCall>(2)

    const connection = new GrpcNodeConnection(metadata, call)
    return connection.verify(this.jwt)
  }
}
