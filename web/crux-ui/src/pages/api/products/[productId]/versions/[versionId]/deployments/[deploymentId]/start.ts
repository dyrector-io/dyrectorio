import { internalError, preconditionFailedError } from '@app/error-responses'
import { DeploymentEvent } from '@app/models'
import { DeploymentProgressMessage } from '@app/models/grpc/protobuf/proto/crux'
import { Status } from '@grpc/grpc-js/build/src/constants'
import crux, { Crux } from '@server/crux/crux'
import { GrpcConnection, ProtoSubscriptionOptions } from '@server/crux/grpc-connection'
import { withMiddlewares } from '@server/middlewares'
import { NextApiRequest, NextApiResponse } from 'next'
import { promisify } from 'util'

const startDeploymentPromise = promisify<string, Crux, void>((deploymentId, cruxInstance, callback) => {
  let connection: GrpcConnection<DeploymentProgressMessage, DeploymentEvent[]> = null
  const opts: ProtoSubscriptionOptions<DeploymentEvent[]> = {
    onMessage: () => {
      if (connection == null) {
        return
      }
      callback(undefined, null)
      connection.cancel()
      connection = null
    },
    onError: err => {
      if (connection == null) {
        return
      }
      callback(err, undefined)
      connection.cancel()
      connection = null
    },
  }

  connection = cruxInstance.deployments.startDeployment(deploymentId, opts)
})

const onPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const deploymentId = req.query.deploymentId as string
  try {
    await startDeploymentPromise(deploymentId, crux(req))

    res.status(200).end()
  } catch (err) {
    const { message, details } = JSON.parse(err.details)
    if (err.code !== Status.FAILED_PRECONDITION) {
      res.status(412).json(internalError(message))
    } else {
      const { property, value } = details

      res.status(412).json(preconditionFailedError(property, message, value))
    }
  }
}

export default withMiddlewares({
  onPost,
})
