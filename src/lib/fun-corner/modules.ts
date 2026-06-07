import type { FunCornerSettings } from './types'

export function isModuleEnabled(settings: FunCornerSettings, moduleId: string): boolean {
  return settings.modules[moduleId] === true
}

export function getActiveModules(settings: FunCornerSettings): string[] {
  return Object.entries(settings.modules)
    .filter(([, enabled]) => enabled)
    .map(([id]) => id)
}
