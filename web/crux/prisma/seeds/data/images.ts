import { Image } from "@prisma/client"
import { constants } from "../consts"

export const images = [
  {
    id: '3E89810C-158B-4026-9C22-0565080F9E6C',
    name: 'nginx',
    tag: '1.0.0',
    registryId: constants.REGISTRY_ID,
    order: 1,
    versionId: constants.VERSION_ID
  },
  {
    id: 'C798461D-7190-4F1E-B828-9E427A803B64',
    name: 'mysql',
    tag: '1.0.0',
    registryId: constants.REGISTRY_ID,
    order: 2,
    versionId: constants.VERSION_ID
  },
  {
    id: 'B3089760-3BF9-444B-9023-2D6BCBD11F8B',
    name: 'mariadb',
    tag: '1.0.0',
    registryId: constants.REGISTRY_ID,
    order: 3,
    versionId: constants.VERSION_ID
  },
  {
    id: 'A94B76A3-BEDD-40A2-A383-80C6464E99F3',
    name: 'd8n-node',
    tag: '1.0',
    registryId: constants.REGISTRY_ID,
    order: 1,
    versionId: '5260B9D6-0BE0-491B-8808-836DC285B12C'
  },
  {
    id: '2F36558F-1357-4195-B3A4-ADBB925A7B10',
    name: 'demo/example',
    tag: 'latest',
    registryId: constants.REGISTRY_ID,
    order: 2,
    versionId: '5260B9D6-0BE0-491B-8808-836DC285B12C'
  },
] as Image[]
