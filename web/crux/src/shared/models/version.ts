export const VERSION_TYPE_VALUES = ['incremental', 'rolling'] as const
export type VersionType = (typeof VERSION_TYPE_VALUES)[number]
