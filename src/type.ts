interface KeyObject<T> {
  [index: string]: T
}

interface AuthDetails {
  key: string
  secret: string
}

enum Networks {
  Testnet = 'testnet',
  Regnet = 'regtest',
  Mainnet = 'main',
}

enum Currencies {
  Bitcoin = 'btc',
}

// debug:
// 0 - no reports to console
// 1 - only error reports to console
// 2 - verbose reporting level
enum DebugLevels {
  MUTE = 0,
  QUIET = 1,
  VERBOSE = 2,
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

interface ApiError {
  name: string
  message: string
  code: number
  data: unknown[]
}

interface QueryOptions {
  limit?: number
  skip?: number
  respondDirect?: boolean
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

enum Endpoints {
  Collect = 'collect',
  Inbox = 'inbox',
  Transfers = 'transfers',
  Networks = 'networks',
  Utxos = 'utxos',
  Exists = 'exists',
  RateToUsd = 'to/usd',
}

// who the service should respond from methods:
// - callback - use provided callback
// - direct - respond directly
enum Responses {
  Callback = 'callback',
  Direct = 'direct',
}

enum EventTypes {
  COLLECT_TRANSACTION = 'service_collect_transaction',
  CREATED_COLLECTABLE = 'service_created_collectable',
  GET_BY_OWNER_ID = 'service_get_by_owner_id',
  GET_COLLECTABLES = 'service_get_collectables',
  GET_FRESH = 'service_get_fresh',
  GET_RETRIEVABLE = 'service_get_retrievable',
  GET_RETRIEVABLES = 'service_get_retrievables',
  GET_USED = 'service_get_used',
  GET_UTXOS = 'service_get_utxos',
  REMOVED_COLLECTABLE = 'service_removed_collectable',
  REMOVED_RETRIEVABLE = 'service_removed_retrievable',
  SEND_MESSAGE = 'service_message',
  SEND_TRANSACTION = 'service_send_transaction',
  UPDATE_STATUS = 'service_update_status',
  UPDATED_COLLECTABLE = 'service_updated_collectable',
  UPDATED_RETRIEVABLE = 'service_updated_retrievable',
  GET_BTC_TO_USD_RATES = 'service_get_btc_to_usd_rates',
  GET_BTC_TO_USD_RATE = 'service_get_btc_to_usd_rate',
  GET_ONLINE_NETWORKS = 'service_get_online_networks',
}

type Event = {
  type: EventTypes
  payload: unknown
}
type EventBus = (event: Event) => void

// eslint-disable-next-line max-len
export {
  ApiError,
  ApiService,
  AuthDetails,
  ConnectProps,
  Currencies,
  DebugLevels,
  Endpoints,
  Event,
  EventBus,
  EventTypes,
  KeyObject,
  Networks,
  NetworkTip,
  QueryOptions,
  Responses,
  Status,
}
