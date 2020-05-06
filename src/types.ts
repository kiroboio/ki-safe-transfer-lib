import { Logger } from './logger'

export enum Currencies {
  Bitcoin = 'btc',
}

export enum Networks {
  Testnet = 'testnet',
  Regnet = 'regtest',
  Mainnet = 'main',
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
  Utxos = 'utxos',
  Exists = 'exists',
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
  owner: string
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
  getStatus: () => Promise<Status | void>
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
  owner?: string
}

export type CollectRequest = {
  id: string
  key: string
}

export type validateReport = {
  message: string
  errors: { [index: string]: string[] }
}

export type StringKeyObject<T> = { [index: string]: T }

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

/**
 * Base interface for Results, providing the pagination details
 *
 * @interface
 * @name Paging
 */
export interface Paging {
  total: number
  skip: number
  limit: number
}

/**
 * Unspent transaction output (UTXO) fields
 *
 * @interface
 * @name Utxo
 */
export interface Utxo {
  address: string
  height: number
  hex: string
  type: 'SCRIPTHASH'
  txid: string
  value: number
  vout: number
}

/**
 * Describes the data getter results.
 *
 * @interface
 * @name Results
 * @param T - type of data array content
 */
export interface Results<T> extends Paging {
  data: Array<T>
}

export interface QueryOptions {
  limit?: number
  skip?: number
  respondDirect?: boolean
}

/**
 * Address as an object. Used in getUsed/getFresh
 *
 * @interface
 * @name Address
 */
export interface Address {
  address: string
}

export interface ResponseError {
  message: string
  code?: number
  name: string
  data?: unknown[]
}

export interface ApiError {
  name: string
  message: string
  code: number
  data: unknown[]
}
