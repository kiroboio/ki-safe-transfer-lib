export enum Currencies {
  Bitcoin = 'btc',
}

export enum Networks {
  Testnet = 'testnet',
  Regnet = 'regnet',
}

// debug:
// 0 - no reports to console
// 1 - only error reports to console
// 2 - verbose reporting level
export enum DebugLevels {
  MUTE = 0,
  QUIET = 1,
  VERBOSE = 2,
}

export type Settings = {
  debug: DebugLevels
  currency: Currencies
  network: Networks
  version: string
}

export interface ConfigProps {
  debug?: DebugLevels
  currency?: Currencies
  network?: Networks
}

export interface ServiceProps extends ConfigProps {}
