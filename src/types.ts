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
  respondAs?: Responses
}

export enum Endpoints {
  Collect = 'collect',
  Inbox = 'inbox',
  Transfers = 'transfers',
  Networks = 'networks',
}

// TODO: fix response type
export interface ApiService {
  find: (arg0?: any) => any
  get: (arg0: any) => any
  create: (arg0: {}) => any
  on: (arg0: string, arg1: (arg2: any) => any) => any
}

export interface ApiResponseError {
  className: string
  code: number
  data: []
  errors: {}
  message: string
  name: string
  type: string
}

export interface NetworkTip {
  height: number
  online: boolean
  netId: string
  timestamp: number
  fee: number
}

export type Retrievable = {
  amount: number
  collect: {
    broadcasted: number
    confirmed: number
    txid: string
  }
  createdAt: string
  deposit: {
    txid: string
    vout: number
  }
  expires: { at: string }
  id: string
  state: string
  to: string
  updatedAt: string
}

export type Collectable = {
  amount: number
  collect: { broadcasted: number; confirmed: number; txid: string }
  createdAt: string
  expires: { at: string }
  from?: string
  hint?: string
  id: string
  salt: string
  state: string
  to: string
  updatedAt: string
}

export type ResponseCollectable = {
  total: number
  limit: number
  skip: number
  data: Collectable[]
}

export type ResponseCollect = {
  fromNodeTxid: string
}

export interface LoggerFunction {
  ({ type, payload, message }: LoggerProps): void
}

export interface ResponderFunction {
  (type: EventTypes, payload: Status | Retrievable | Collectable[] | ResponseCollect | Message): any
}

interface LibraryBlockProps {
  debug?: DebugLevels
  currency?: Currencies
  network?: Networks
}

export interface ServiceProps extends LibraryBlockProps {
  eventBus?: EventBus
  respondAs?: Responses
}

export interface ConfigProps extends LibraryBlockProps {
  getStatus: () => any
  logger: LoggerFunction
  refreshInbox: () => void
}

// who the service should respond from methods:
// - callback - use provided callback
// - direct - respond directly
export enum Responses {
  Callback = 'callback',
  Direct = 'direct',
}

export enum Logger {
  Error = 0,
  Info = 1,
  Warning = 2,
}

export interface LoggerProps {
  type: Logger
  payload?: Status | Retrievable | Collectable[] | ResponseCollect | string
  message: string
}

export enum EventTypes {
  GET_RETRIEVABLE = 'service_get_retrievable',
  GET_COLLECTABLES = 'service_get_collectables',
  UPDATE_STATUS = 'service_update_status',
  SEND_TRANSACTION = 'service_send_transaction',
  COLLECT_TRANSACTION = 'service_collect_transaction',
  UPDATED_RETRIEVABLE = 'service_updated_retrievable',
  UPDATED_COLLECTABLE = 'service_updated_collectable',
  REMOVED_COLLECTABLE = 'service_removed_collectable',
  CREATED_COLLECTABLE = 'service_created_collectable',
  SEND_MESSAGE = 'service_message',
}

export type Message = {
  text: string
  isError: boolean
  data?: unknown
}

export type Status = {
  height: number //block height of the blockchain
  fee: number // current transaction fees (per Kilobyte)
  online: boolean // status of server connection to blockchain
}

export type Event = {
  type: EventTypes
  payload: Status | Retrievable | Collectable | Collectable[] | ResponseCollect | Message
}

export type EventBus = {
  (arg0: Event): void
}

export type Sendable = {
  amount: number
  collect: string
  deposit: string
  from?: string
  hint?: string
  id?: string
  to: string
}

export type CollectRequest = {
  id: string
  key: string
}
export type validateReport = {
  message: string
  errors: { [index: string]: string[] }
}

export type ObjectWithStringKeys = {
  [index: string]: string[] | number[] | string
}

export type ObjectWithStringKeysAnyValues = { [index: string]: any }
