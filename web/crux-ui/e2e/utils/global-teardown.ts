/* eslint-disable import/no-extraneous-dependencies */
import { FullConfig } from '@playwright/test'
import CruxClients from '@server/crux/crux-clients'
import DyoTeamService from '@server/crux/team-service'
import { cruxAddressFromConfig, deleteUserByEmail, getUserByEmail, kratosFromConfig, USER_EMAIL } from './common'

const globalTeardown = async (config: FullConfig) => {
  const kratos = kratosFromConfig(config)
  const identity = await getUserByEmail(kratos, USER_EMAIL)
  if (!identity) {
    return
  }

  const cruxAddress = cruxAddressFromConfig(config)
  const clients = new CruxClients(cruxAddress, undefined)
  const teams = new DyoTeamService(clients.teams, identity, null)
  const team = await teams.getActiveTeam()
  if (team) {
    await teams.deleteTeam(team.id)
  }

  await deleteUserByEmail(kratos, USER_EMAIL)
}

export default globalTeardown
