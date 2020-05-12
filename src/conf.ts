import { KeyObject } from './type'

const version = 'v1' as const

const apiUrl = 'https://api.kirobo.me' as const

const endpoints: KeyObject<string> = {
  collect: 'transfer/action/collect',
  inbox: 'transfer/inbox',
  transfers: 'transfers',
  utxos: 'utxos',
  exists: 'exists',
} as const

export { version, apiUrl, endpoints }
