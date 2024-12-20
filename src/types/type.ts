import { DebugLevels, Currencies, Networks, Responses, Watch, EventTypes, QueryOptions } from '.'
import { RetrieveRequest } from './retrieve'
import { SendRequest } from './send'
import { CollectRequest } from './collect'

interface AuthDetails {
  key: string
  secret: string
}

type Status = NetworkTip

interface ConnectProps {
  debug?: DebugLevels
  currency?: Currencies
  network?: Networks
  authDetails: AuthDetails
  eventBus?: EventBus
  respondAs?: Responses
  watch?: Watch
}

interface NetworkTip {
  height: number
  online: boolean
  netId: string
  timestamp: number
  fees: number[]
  fee: number
  updatedAt: string | Date
}

interface ApiService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  find: (arg0?: unknown) => any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get: (arg0: unknown) => any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create: (arg0: Record<string, unknown> | RetrieveRequest | SendRequest | CollectRequest) => any
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
 * Describes lastAddresses object, which is props for getCollectables
 *
 * @interface
 * @enum LastAddresses
 */
interface LastAddresses {
  addresses: string[]
  options?: QueryOptions
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

interface MinMax {
  min?: number
  max?: number
}

interface DataSpec {
  [key: string]: {
    type: string
    required?: boolean
    length?: MinMax
  }
}

interface RawTransaction {
  txid: string
  hex: string
}

// eslint-disable-next-line max-len
export {
  LastAddresses,
  ApiService,
  AuthDetails,
  ConnectProps,
  Event,
  EventBus,
  NetworkTip,
  Status,
  Message,
  Settings,
  Utxo,
  MinMax,
  DataSpec,
  RawTransaction,
}
