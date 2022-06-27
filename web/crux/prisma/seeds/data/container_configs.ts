import { ContainerConfig } from '@prisma/client'

export const containerConfigs = [
  {
    capabilities: [],
    config: `{"name":"nginx"}`,
    environment: [],
    imageId: '3E89810C-158B-4026-9C22-0565080F9E6C'
  },
  {
    capabilities: [],
    config: {"name":"mysql"},
    environment: [],
    imageId: 'C798461D-7190-4F1E-B828-9E427A803B64'
  },
  {
    capabilities: [],
    config: {"name":"mariadb"},
    environment: [],
    imageId: 'B3089760-3BF9-444B-9023-2D6BCBD11F8B'
  },
  {
    capabilities: [],
    config: {"name":"d8n-node"},
    environment: [],
    imageId: 'A94B76A3-BEDD-40A2-A383-80C6464E99F3'
  },
  {
    capabilities: [],
    config: {"name":"demo/example"},
    environment: [],
    imageId: '2F36558F-1357-4195-B3A4-ADBB925A7B10'
  }
] as ContainerConfig[]
