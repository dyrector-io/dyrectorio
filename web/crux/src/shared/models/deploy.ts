export const DEPLOYMENT_STATUS_VALUES = [
  'preparing',
  'in-progress',
  'successful',
  'failed',
  'obsolete',
  'downgraded',
] as const
export type DeploymentStatus = (typeof DEPLOYMENT_STATUS_VALUES)[number]
