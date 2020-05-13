import { DebugLevels } from '../types'
import { is } from './mode'

function debugLevelSelector(debug: DebugLevels | undefined): DebugLevels {
  if (debug && [0,1,2,4].includes(debug)) return debug

  if (is('test')) return DebugLevels.MUTE

  if (is('dev')) return DebugLevels.VERBOSE

  return DebugLevels.QUIET
}

export { debugLevelSelector }
