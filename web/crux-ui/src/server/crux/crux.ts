/* eslint-disable import/no-cycle */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-shadow */
// TODO(Balanceee): refactor
import { CruxHealth } from '@app/models'
import { API_HEALTH } from '@app/routes'
import { getCrux } from '@server/crux-api'
import { Identity } from '@ory/kratos-client'
import { sessionOf, sessionOfContext } from '@server/kratos'
import { NextApiRequest, NextPageContext } from 'next'
import CruxClients from './crux-clients'
import DyoDeploymentService from './deployment-service'
import DyoNodeService from './node-service'

export class Crux {
  private _nodes: DyoNodeService

  private _deployments: DyoDeploymentService

  private constructor(
    private clients: CruxClients,
    public readonly identity: Identity,
    public readonly cookie: string,
  ) {}

  get nodes() {
    return this._nodes ?? new DyoNodeService(this.clients.nodes)
  }

  get deployments() {
    return this._deployments ?? new DyoDeploymentService(this.clients.deployments, this.cookie)
  }

  public static withIdentity(identity: Identity, cookie: string): Crux {
    return new Crux(global.cruxClients, identity, cookie)
  }
}

if (!global.cruxClients) {
  try {
    global.cruxClients = new CruxClients(process.env.CRUX_API_ADDRESS)
  } catch (err) {
    if (process.env.NEXT_PHASE !== 'phase-production-build') {
      if (err.error === 'invalidArgument') {
        throw new Error('CRUX_API_ADDRESS cannot be empty!')
      }

      throw err
    }
  }
}

export const getCruxHealth = async (): Promise<CruxHealth> => await getCrux<CruxHealth>(null, API_HEALTH)

export const cruxFromContext = (context: NextPageContext): Crux => {
  const { req } = context
  const { headers } = req
  const { cookie } = headers
  const session = sessionOfContext(context)
  return Crux.withIdentity(session?.identity, cookie)
}

const crux = (req: NextApiRequest): Crux => {
  const { headers } = req
  const { cookie } = headers
  const session = sessionOf(req)
  return Crux.withIdentity(session?.identity, cookie)
}

export default crux
