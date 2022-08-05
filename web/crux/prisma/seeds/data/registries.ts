import { Registry } from "@prisma/client"
import { constants } from "../consts"

export const registries = [
  {
    name: 'Harbor dyrector.io registry',
    description:
      'Sed eu justo at dolor efficitur fermentum at sed quam. Nullam tellus magna, sollicitudin eu elementum sit amet, gravida sed tortor.',
    createdBy: 'a27c0bb3-4c67-4a60-9f0e-5ef2bc6c666b',
    createdAt: new Date(),
    icon: 'lion',
    url: 'reg.dyrector.io',
    user: 'harbor_user',
    token: 'random-generated-token-here',
    teamId: constants.TEAM_ID,
    type: 'v2',
  },
  {
    id: constants.REGISTRY_ID,
    name: 'Sunilium public regisry',
    description:
      'Sed eu justo at dolor efficitur fermentum at sed quam. Nullam tellus magna, sollicitudin eu elementum sit amet, gravida sed tortor.',
    createdBy: 'a27c0bb3-4c67-4a60-9f0e-5ef2bc6c666b',
    createdAt: new Date(),
    icon: 'dog',
    url: 'reg.sunilium.com',
    teamId: constants.TEAM_ID,
    type: 'v2',
  },
] as Omit<Registry, "id">[]
