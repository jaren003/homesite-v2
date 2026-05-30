import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import type { Message } from './ollama.ts'

export interface Conversation {
  id: string
  messages: Message[]
}

function conversationsDir(): string {
  return process.env.CONVERSATIONS_DIR ?? join(process.cwd(), 'data', 'conversations')
}

function filePath(id: string): string {
  return join(conversationsDir(), `${id}.json`)
}

export async function saveConversation(conversation: Conversation): Promise<void> {
  const dir = conversationsDir()
  await mkdir(dir, { recursive: true })
  await writeFile(filePath(conversation.id), JSON.stringify(conversation, null, 2), 'utf-8')
}

export async function loadConversation(id: string): Promise<Conversation | null> {
  try {
    const raw = await readFile(filePath(id), 'utf-8')
    return JSON.parse(raw) as Conversation
  } catch {
    return null
  }
}
