import { createHash } from 'node:crypto'
import { appendFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import type { RoutingDecision, TiersConfig } from './types'
import _tiers from '../../../config/tiers.json'

const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434'
const CLASSIFIER_TIMEOUT_MS = 3_000
const LOG_PATH = join(process.cwd(), 'logs', 'routing.jsonl')

const tiers = _tiers as TiersConfig

// Patterns that unambiguously require an external tool call
const TOOL_PATTERNS = [
  /\bsearch\b/i,
  /\blook up\b/i,
  /\bfind online\b/i,
  /\bwhat'?s (happening|going on)\b/i,
  /\bcurrent(ly)?\b/i,
  /\blatest\b/i,
  /\btoday'?s?\b/i,
  /\bnews\b/i,
  /\blive\b/i,
  /\breal[ -]time\b/i,
]

function hasToolUseKeyword(prompt: string): boolean {
  return TOOL_PATTERNS.some(p => p.test(prompt))
}

async function classifyWithOllama(prompt: string): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), CLASSIFIER_TIMEOUT_MS)

  try {
    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'phi3:mini',
        prompt: `Classify the prompt: SIMPLE, COMPLEX, or TOOL.\nTOOL = requires web search or external tool use.\nRespond with exactly one word.\nPrompt: ${prompt}`,
        stream: false,
      }),
      signal: controller.signal,
    })

    const data = (await res.json()) as { response: string }
    const word = data.response.trim().toUpperCase().split(/\s/)[0]
    if (word === 'SIMPLE' || word === 'COMPLEX' || word === 'TOOL') return word
    return 'COMPLEX'
  } finally {
    clearTimeout(timer)
  }
}

function logDecision(promptHash: string, decision: RoutingDecision): void {
  try {
    mkdirSync(join(process.cwd(), 'logs'), { recursive: true })
    appendFileSync(
      LOG_PATH,
      JSON.stringify({
        ts: new Date().toISOString(),
        promptHash,
        tier: decision.tier,
        model: decision.model,
        reason: decision.reason,
      }) + '\n',
    )
  } catch {
    // logging failures are non-fatal
  }
}

export async function classifyPrompt(prompt: string): Promise<RoutingDecision> {
  const promptHash = createHash('sha256').update(prompt).digest('hex').slice(0, 16)

  // Keyword-based tool-use escalation — skips Ollama entirely
  if (hasToolUseKeyword(prompt)) {
    const decision: RoutingDecision = { tier: 'T4', model: tiers.T4.model, reason: 'TOOL' }
    logDecision(promptHash, decision)
    return decision
  }

  let classification: string
  try {
    classification = await classifyWithOllama(prompt)
  } catch {
    // Timeout or Ollama unavailable → silent fallback to T2
    const decision: RoutingDecision = {
      tier: 'T2',
      model: tiers.T2.model,
      reason: 'classifier_unavailable',
    }
    logDecision(promptHash, decision)
    return decision
  }

  const decision: RoutingDecision =
    classification === 'SIMPLE'
      ? { tier: 'T1', model: tiers.T1.model, reason: 'SIMPLE' }
      : classification === 'TOOL'
        ? { tier: 'T4', model: tiers.T4.model, reason: 'TOOL' }
        : { tier: 'T2', model: tiers.T2.model, reason: 'COMPLEX' }

  logDecision(promptHash, decision)
  return decision
}
