import { KeyObject } from './types'

const connectionTriesMax = 3

const version = 'v1' as const

const apiUrl = 'https://api.kirobo.me' as const

const endpoints: KeyObject<string> = {
  collect: 'transfer/action/collect',
  retrieve: 'transfer/action/retrieve',
  inbox: 'transfer/inbox',
  transfers: 'transfers',
  utxos: 'utxos',
  exists: 'exists',
} as const

export { version, apiUrl, endpoints,connectionTriesMax }
