export const AGENT_KICK_REASON_VALUES = ['delete-node', 'revoke-token'] as const
export type AgentKickReason = (typeof AGENT_KICK_REASON_VALUES)[number]
