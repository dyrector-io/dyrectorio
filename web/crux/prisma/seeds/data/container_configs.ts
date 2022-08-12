import { ContainerConfig } from '@prisma/client'

export const containerConfigs = [
  {
    name: 'nginx',
    capabilities: [],
    config: {},
    environment: [],
    imageId: '3E89810C-158B-4026-9C22-0565080F9E6C',
  },
  {
    name: 'mysql',
    capabilities: [],
    config: {},
    environment: [],
    imageId: 'C798461D-7190-4F1E-B828-9E427A803B64',
  },
  {
    name: 'mariadb',
    capabilities: [],
    config: {},
    environment: [],
    imageId: 'B3089760-3BF9-444B-9023-2D6BCBD11F8B',
  },
  {
    name: 'd8n-node',
    capabilities: [],
    config: {},
    environment: [],
    imageId: 'A94B76A3-BEDD-40A2-A383-80C6464E99F3',
  },
  {
    name: 'demo-example',
    capabilities: [],
    config: {},
    environment: [],
    imageId: '2F36558F-1357-4195-B3A4-ADBB925A7B10',
  },
] as Omit<ContainerConfig, 'id'>[]
