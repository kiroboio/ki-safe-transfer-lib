import { DebugLevels } from '../type'
import { is } from './mode'

function debugLevelSelector(debug: DebugLevels | undefined): DebugLevels {
  if (debug === 0 || debug === 1 || debug === 2) return debug

  if (is('test')) return DebugLevels.MUTE

  if (is('dev')) return DebugLevels.VERBOSE

  return DebugLevels.QUIET
}

export { debugLevelSelector }
