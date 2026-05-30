export type Tier = 'T1' | 'T2' | 'T3'

export interface RoutingDecision {
  tier: Tier
  model: string
  reason: string
}

const ROUTING_ENGINE_URL = process.env.ROUTING_ENGINE_URL ?? 'http://localhost:3000'

export async function classifyPrompt(prompt: string): Promise<RoutingDecision> {
  const res = await fetch(`${ROUTING_ENGINE_URL}/api/classify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })
  if (!res.ok) throw new Error(`Routing engine error: ${res.status}`)
  return res.json() as Promise<RoutingDecision>
}
