import { Status } from '@grpc/grpc-js/build/src/constants'

export type CruxGrpcError = {
  status: Status
  message: string
}

export type AlreadyExistsError = CruxGrpcError & {
  property: string
  value?: any
}

export type NotFoundError = CruxGrpcError & {
  property: string
  value?: any
}

export type InvalidArgumentError = CruxGrpcError & {
  property: string
  value?: any
}

export type PreconditionFailedError = CruxGrpcError & {
  property: string
  value?: any
}

export type UnavailableError = CruxGrpcError

export type UnauthenticatedError = CruxGrpcError

export type InternalError = CruxGrpcError
