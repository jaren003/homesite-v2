// BSC Corner — server component.
// Seeds initial notes from disk so the client doesn't need an extra fetch on load.
import { readNotes } from '@/lib/bsc/storage'
import BscClient from './BscClient'

export default function BscPage() {
  const initialNotes = readNotes()
  return <BscClient initialNotes={initialNotes} />
}
