import { Node } from '@prisma/client'

const DEFAULT_TEAM_ID = 'db743621-dd72-47a3-b43b-0173b9af2c91'

export const nodes = [
  {
    id: 'cb7e9573-9a43-4d5b-8005-eb8bb7a423c4',
    name: 'Local',
    description:
      'Sed eu justo at dolor efficitur fermentum at sed quam. Nullam tellus magna, sollicitudin eu elementum sit amet, gravida sed tortor.',
    createdBy: 'a27c0bb3-4c67-4a60-9f0e-5ef2bc6c666b',
    address: '',
    icon: 'kangaroo',
    teamId: DEFAULT_TEAM_ID,
  },
  {
    id: '0e371059-1344-46e7-9d21-df713b499959',
    name: 'AWS @ EC2 001',
    description:
      'Sed eu justo at dolor efficitur fermentum at sed quam. Nullam tellus magna, sollicitudin eu elementum sit amet, gravida sed tortor.',
    createdBy: 'a27c0bb3-4c67-4a60-9f0e-5ef2bc6c666b',
    address: '',
    icon: 'monkey',
    teamId: DEFAULT_TEAM_ID,
  },
] as Node[]
