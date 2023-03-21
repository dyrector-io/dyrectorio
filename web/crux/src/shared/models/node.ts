export const NODE_TYPE_VALUES = ['docker', 'k8s'] as const
export type NodeType = (typeof NODE_TYPE_VALUES)[number]

export type NodeStatus = 'connecting' | 'unreachable' | 'running'
