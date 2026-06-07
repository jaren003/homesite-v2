import { createHash } from 'node:crypto'

export function hashPin(pin: string): string {
  return createHash('sha256').update(pin).digest('hex')
}

export function verifyPin(input: string, storedHash: string): boolean {
  return hashPin(input) === storedHash
}
