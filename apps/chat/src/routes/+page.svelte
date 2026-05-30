<script lang="ts">
  import { onMount } from 'svelte'
  import type { Message } from '$lib/ollama.ts'

  let messages: (Message & { pending?: boolean })[] = []
  let prompt = ''
  let sending = false
  let conversationId = ''

  onMount(async () => {
    const storage = typeof localStorage !== 'undefined' ? localStorage : null
    conversationId = storage?.getItem('conversationId') ?? crypto.randomUUID()
    storage?.setItem('conversationId', conversationId)

    try {
      const res = await fetch(`/api/history?id=${encodeURIComponent(conversationId)}`)
      if (res.ok) {
        const data = (await res.json()) as { messages: Message[] }
        messages = data.messages ?? []
      }
    } catch {
      // history load failure is non-fatal
    }
  })

  async function saveHistory(msgs: Message[]) {
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation: { id: conversationId, messages: msgs } }),
      })
    } catch {
      // save failure is non-fatal
    }
  }

  async function send() {
    if (!prompt.trim() || sending) return
    const text = prompt.trim()
    prompt = ''
    sending = true

    messages = [...messages, { role: 'user', content: text }]
    const assistantIdx = messages.length
    messages = [...messages, { role: 'assistant', content: '', pending: true }]

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, history: messages.slice(0, assistantIdx - 1) }),
      })

      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const dec = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const raw = dec.decode(value, { stream: true })
        for (const line of raw.split('\n')) {
          if (line.startsWith('data: ')) {
            messages[assistantIdx] = {
              ...messages[assistantIdx],
              content: messages[assistantIdx].content + line.slice(6),
            }
            messages = [...messages]
          }
        }
      }
    } finally {
      messages[assistantIdx] = { ...messages[assistantIdx], pending: false }
      messages = [...messages]
      sending = false

      const toSave = messages
        .filter(m => !m.pending)
        .map(({ role, content }) => ({ role, content }))
      await saveHistory(toSave)
    }
  }

  async function clearHistory() {
    conversationId = crypto.randomUUID()
    const storage = typeof localStorage !== 'undefined' ? localStorage : null
    storage?.setItem('conversationId', conversationId)
    messages = []
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }
</script>

<main>
  <header>
    <h1>Chat</h1>
    <button class="clear" on:click={clearHistory} disabled={sending}>New conversation</button>
  </header>

  <ol role="log" aria-label="conversation">
    {#each messages as msg}
      <li class="message {msg.role}" class:pending={msg.pending}>
        <span class="role">{msg.role === 'user' ? 'You' : 'Assistant'}</span>
        <p>{msg.content}{msg.pending ? '▌' : ''}</p>
      </li>
    {/each}
  </ol>

  <form on:submit|preventDefault={send}>
    <textarea
      aria-label="prompt"
      bind:value={prompt}
      on:keydown={onKeydown}
      placeholder="Message…"
      rows={3}
      disabled={sending}
    ></textarea>
    <button type="submit" disabled={sending}>Send</button>
  </form>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    height: 100dvh;
    max-width: 48rem;
    margin: 0 auto;
    padding: 1rem;
    gap: 1rem;
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  h1 {
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0;
  }

  ol[role='log'] {
    flex: 1;
    overflow-y: auto;
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .message {
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    max-width: 80%;
  }

  .message.user {
    align-self: flex-end;
    background: #1a73e8;
    color: #fff;
  }

  .message.assistant {
    align-self: flex-start;
    background: #f1f3f4;
    color: #202124;
  }

  .role {
    font-size: 0.7rem;
    font-weight: 600;
    opacity: 0.7;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  p {
    margin: 0.25rem 0 0;
    white-space: pre-wrap;
    word-break: break-word;
  }

  form {
    display: flex;
    gap: 0.5rem;
    align-items: flex-end;
  }

  textarea {
    flex: 1;
    resize: none;
    border: 1px solid #dadce0;
    border-radius: 0.5rem;
    padding: 0.5rem 0.75rem;
    font: inherit;
    font-size: 1rem;
    min-height: 2.75rem;
  }

  button {
    padding: 0.75rem 1.25rem;
    border-radius: 0.5rem;
    background: #1a73e8;
    color: #fff;
    border: none;
    cursor: pointer;
    font: inherit;
    font-weight: 600;
    font-size: 1rem;
    touch-action: manipulation;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  button.clear {
    background: transparent;
    color: #1a73e8;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
  }
</style>
