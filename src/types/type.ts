import { Responses, Networks, Currencies, DebugLevels, EventTypes } from './enums'

interface KeyObject<T> {
  [index: string]: T
}

interface AuthDetails {
  key: string
  secret: string
}

type Status = Omit<NetworkTip, 'netId' | 'timestamp'>

interface ConnectProps {
  debug?: DebugLevels
  currency?: Currencies
  network?: Networks
  authDetails: AuthDetails
  eventBus?: EventBus
  respondAs?: Responses
}


interface NetworkTip {
  height: number
  online: boolean
  netId: string
  timestamp: number
  fee: number
}

interface ApiService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  find: (arg0?: unknown) => any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get: (arg0: unknown) => any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create: (arg0: {}) => any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on: (arg0: string, arg1: (arg2: any) => any) => any
}

type Event = {
  type: EventTypes
  payload: unknown
}
type EventBus = (event: Event) => void

// TODO: do we need it?s
 type Message = {
  text: string
  isError: boolean
  data?: unknown
}

 type Settings = {
  debug: DebugLevels
  currency: Currencies
  network: Networks
  version: string
  respondAs?: Responses
}


/**
 * Unspent transaction output (UTXO) fields
 *
 * @interface
 * @name Utxo
 */
interface Utxo {
  address: string
  height: number
  hex: string
  type: 'SCRIPTHASH'
  txid: string
  value: number
  vout: number
}

// eslint-disable-next-line max-len
export { ApiService, AuthDetails, ConnectProps, Event, EventBus, KeyObject, NetworkTip, Status, Message, Settings,Utxo }
