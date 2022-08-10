import { Instance } from "@prisma/client"
import { constants } from "../consts"

export const instances = [
  {
      state: 'created',
      deploymentId: constants.DEPLYOMENT_ID,
      imageId: '3E89810C-158B-4026-9C22-0565080F9E6C'
  },
  {
    state: 'created',
    deploymentId: constants.DEPLYOMENT_ID,
    imageId: 'C798461D-7190-4F1E-B828-9E427A803B64'
},
{
    state: 'created',
    deploymentId: constants.DEPLYOMENT_ID,
    imageId: 'B3089760-3BF9-444B-9023-2D6BCBD11F8B'
},
{
    id: 'FC5CC3C3-875C-404F-B8BB-31E731045AF7',
    state: 'created',
    deploymentId: 'D2E10D2D-FA89-4CAF-BEAD-7635EC51C734',
    imageId: 'A94B76A3-BEDD-40A2-A383-80C6464E99F3'
},
{
    id: '925771C9-4AB9-4EEA-A8B6-8AA93B96CD65',
    state: 'created',
    deploymentId: 'D2E10D2D-FA89-4CAF-BEAD-7635EC51C734',
    imageId: '2F36558F-1357-4195-B3A4-ADBB925A7B10'
},

] as Instance[]
