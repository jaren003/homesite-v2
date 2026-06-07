export type Tier = 'T1' | 'T2' | 'T3' | 'T4'

export interface RoutingDecision {
  tier: Tier
  model: string
  reason: string
}

export interface TierConfig {
  role: string
  model: string
}

export interface TiersConfig {
  T1: TierConfig
  T2: TierConfig
  T3: TierConfig
  T4: TierConfig
}
