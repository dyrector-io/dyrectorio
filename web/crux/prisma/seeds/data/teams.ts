import { Team } from '@prisma/client'
import { constants } from '../consts'

export const teams = [
  {
    id: constants.TEAM_ID,
    createdBy: constants.USER_ID,
    name: 'Default Team',
  },
] as Team[]
