import { exec, ExecOptions } from 'child_process'
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
  const clients = new CruxClients(cruxAddress)
  const teams = new DyoTeamService(clients.teams, identity, null)
  const team = await teams.getActiveTeam()
  if (team) {
    await teams.deleteTeam(team.id)
  }

  await deleteUserByEmail(kratos, USER_EMAIL)

  const settings: ExecOptions =
    process.platform === 'win32'
      ? {
          shell: 'C:\\Program Files\\git\\git-bash.exe',
        }
      : null

  exec(`docker rm -f $(docker ps -a -q --filter "name=^pw")`, settings)
  exec('docker rm -f dagent', settings)
}

export default globalTeardown
