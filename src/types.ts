import { Logger } from './logger'

export enum Currencies {
  Bitcoin = 'btc',
}

export enum Networks {
  Testnet = 'testnet',
  Regnet = 'regnet',
  Mainnet = 'mainnet',
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

export interface ApiService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  find: (arg0?: unknown) => any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get: (arg0: unknown) => any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create: (arg0: {}) => any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

interface LibraryBlockProps {
  debug?: DebugLevels
  currency?: Currencies
  network?: Networks
  authDetails: AuthDetails
}

export interface ServiceProps extends LibraryBlockProps {
  eventBus?: EventBus
  respondAs?: Responses
}

export interface ConfigProps extends LibraryBlockProps {
  getStatus: () => Status | undefined
  logger: Logger
  refreshInbox: () => void
}

// who the service should respond from methods:
// - callback - use provided callback
// - direct - respond directly
export enum Responses {
  Callback = 'callback',
  Direct = 'direct',
}

/** Props for Logger class */
export interface LoggerProps {
  debug: DebugLevels
}

export enum EventTypes {
  GET_RETRIEVABLE = 'service_get_retrievable',
  GET_COLLECTABLES = 'service_get_collectables',
  UPDATE_STATUS = 'service_update_status',
  SEND_TRANSACTION = 'service_send_transaction',
  COLLECT_TRANSACTION = 'service_collect_transaction',
  UPDATED_RETRIEVABLE = 'service_updated_retrievable',
  REMOVED_RETRIEVABLE = 'service_removed_retrievable',
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
  height: number // block height of the blockchain
  fee: number // current transaction fees (per Kilobyte)
  online: boolean // status of server connection to blockchain
}

export type Event = {
  type: EventTypes
  payload: unknown
}

export type EventBus = {
  (event: Event): void
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

export type ObjectWithStringKeysAnyValues<T> = { [index: string]: T }

// types of switch actions
export enum SwitchActions {
  STATUS = 'status',
  CONNECT = 'connect',
}

// switch function props for connect
export interface Switch {
  action: SwitchActions
  value?: boolean
}

export interface AuthDetails {
  key: string
  secret: string
}

export type ResponderPayload = Status | Retrievable | Collectable[] | ResponseCollect | Message
