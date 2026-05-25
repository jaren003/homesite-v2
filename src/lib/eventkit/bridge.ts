// ── EventKit Bridge ───────────────────────────────────────────────────────────
// Spawns the compiled Swift CLI and parses its JSON stdout.
// The binary is at scripts/eventkit-bridge/eventkit-bridge (built via build.sh).

import { execFile } from 'child_process'
import path from 'path'

const BRIDGE_BIN = path.resolve(
  process.cwd(),
  'scripts/eventkit-bridge/eventkit-bridge',
)

const DEFAULT_TIMEOUT_MS = 10_000

export class BridgeError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message)
    this.name = 'BridgeError'
  }
}

interface ExecOptions {
  timeoutMs?: number
}

/**
 * Spawn the EventKit bridge binary with `args`, parse its JSON stdout,
 * and return the parsed object.
 *
 * @throws BridgeError on non-zero exit, JSON parse failure, or timeout.
 */
export function execBridge<T = unknown>(
  args: string[],
  options: ExecOptions = {},
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS

  return new Promise<T>((resolve, reject) => {
    let timedOut = false

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const child: any = execFile(BRIDGE_BIN, args, (err, stdout, stderr) => {
      if (timedOut) return

      if (err) {
        reject(new BridgeError(`Bridge exited with error: ${stderr || err.message}`, err))
        return
      }

      try {
        resolve(JSON.parse(stdout) as T)
      } catch (parseErr) {
        reject(new BridgeError(`Bridge returned invalid JSON: ${stdout.slice(0, 200)}`, parseErr))
      }
    })

    const timer = setTimeout(() => {
      timedOut = true
      child.kill()
      reject(new BridgeError(`Bridge timed out after ${timeoutMs}ms`))
    }, timeoutMs)

    // Clear the timer if the process finishes before timeout
    child?.on?.('close', () => clearTimeout(timer))
  })
}
