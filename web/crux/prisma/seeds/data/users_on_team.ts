import { UsersOnTeams } from '@prisma/client'
import { constants } from '../consts'


export const usersOnTeam = [
  {
      userId: constants.USER_ID,
      teamId: constants.TEAM_ID,
      owner: true,
      active: true
  },
] as UsersOnTeams[]
