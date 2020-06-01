import { DebugLevels } from '..'
import { modeIs } from './mode'

function debugLevelSelector(debug: DebugLevels | undefined): DebugLevels {
  if (debug && [0,1,2,4].includes(debug)) return debug

  if (modeIs('test')) return DebugLevels.MUTE

  if (modeIs('development')) return DebugLevels.VERBOSE

  return DebugLevels.QUIET
}

export { debugLevelSelector }
