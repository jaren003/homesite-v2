# apps/chat

SvelteKit AI chat app for homesite-v2. Runs on port 3001; routes prompts through the Next.js routing engine to Ollama (T1/T2) or Claude (T3).

## Prerequisites

- Node.js 20+
- [Ollama](https://ollama.com/download) running with `phi3:mini` (T1) and `llama3:8b` (T2) pulled
- Anthropic and Brave Search API keys (for T3 responses)

## Startup order

**The Next.js routing engine must be running before this app starts.**

```bash
# 1. Start Ollama (if not already running as a service)
ollama serve

# 2. Start the Next.js routing engine (repo root)
cd /path/to/homesite-v2
npm run dev          # listens on http://localhost:3000

# 3. Start this app
cd apps/chat
npm install          # first time only
npm run dev          # listens on http://localhost:3001
```

## Environment variables

Create `apps/chat/.env.local` (gitignored):

```
ANTHROPIC_API_KEY=sk-ant-...        # required for T3 Claude responses
BRAVE_API_KEY=BSA...                 # required for T3 web search

# Optional overrides (defaults shown):
# ROUTING_ENGINE_URL=http://localhost:3000
# OLLAMA_URL=http://localhost:11434
# CONVERSATIONS_DIR=./data/conversations
# PORT=3001
# HOST=0.0.0.0
```

Keys:
- `ANTHROPIC_API_KEY` — [console.anthropic.com](https://console.anthropic.com) → API Keys
- `BRAVE_API_KEY` — [api.search.brave.com](https://api.search.brave.com) → Free tier available

## LAN access (iPad / phone)

Set `HOST=0.0.0.0` (default) and open `http://<mac-mini-hostname>.local:3001` from any device on the same Wi-Fi network. Find the hostname with:

```bash
hostname          # or: ipconfig getifaddr en0
```

The homesite nav also links to the chat app. Set `NEXT_PUBLIC_CHAT_URL` in the root `.env.local` to point at the LAN URL:

```
# repo root .env.local
NEXT_PUBLIC_CHAT_URL=http://mac-mini.local:3001
```

## Development

```bash
npm run dev      # start dev server
npm test         # run unit tests (vitest)
npm run build    # production build
```

Conversation JSON files are saved under `data/conversations/` and are gitignored.
