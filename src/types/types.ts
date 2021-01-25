// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyValue = any;

export type Either<T, K> = T | K;

export type Maybe<T> = T | undefined | null;

export interface AuthDetails {
  key: string;
  secret: string;
}

// export interface ApiService {
//   find: (arg0?: unknown) => AnyValue;
//   get: (arg0: unknown) => AnyValue;
//   create: (arg0: Record<string, unknown>) => AnyValue;
//   on: (arg0: string, arg1: (arg2: AnyValue) => AnyValue) => AnyValue;
// }

export interface BroadcastConfirmation {
  broadcasted: number;
  confirmed: number;
  txid: string;
}

export interface EthTransfer {
  collect: BroadcastConfirmation;
  createdAt: string;
  expires: {
    at: string;
  };
  fees: string;
  from: string;
  id: string;
  message: string;
  retrieve: BroadcastConfirmation;
  salt: string;
  secretHash: string;
  state: string; // 'waiting-for-deposit' | 'retrieved' | 'ready' | 'collecting' | 'collected' | 'rejected' | 'invalid' | 'new';
  to: string;
  updatedAt: string;
  value: string;
}

export enum RatesSources {
  BITFINEX = 'bitfinex.com',
  BLOCKCHAIN = 'blockchain.info',
  COINGECKO = 'coingecko.com',
}

export interface ExchangeRate {
  source: RatesSources;
  timestamp: number;
  online: boolean;
  value: number;
}

export enum Watch {
  DISABLE = 'disable', // to cancel all subscriptions (was ’none’ before) - this is the default behavior when watch param does not exist
  ADD = 'add', // to add this query to the existing subscriptions (or create a new subscription for the current query when there is none)
  REPLACE = 'replace', // to remove old subscriptions and create a new subscription for the current query
  IGNORE = 'ignore', // the current query won’t affect the existing subscription
}

export interface NetworkTip {
  height: number;
  online: boolean;
  netId: string;
  timestamp: number;
  fees: number[];
  fee: number;
  updatedAt: string | Date;
}

export interface Contract {
  address: string;
  synced: true;
}

export interface EthNetworkItem {
  height: number;
  online: boolean;
  netId: string;
  timestamp: number;
  updatedAt: string;
  contracts: Record<string, Contract>;
}

export interface BtcTransfer {
  amount: number; // the transfer amount in satoshi,minimum: 0
  collect: {
    broadcasted: number; // blockchain height
    confirmed: number; // block number of confirmed transaction
    txid: string; // the tx id of the transaction
  };
  createdAt: string | Date; // create date-time
  deposit: {
    address: string;
    path?: string;
    txid: string; // the tx id of the transaction
    value: number;
    vout: number;
  };
  expires: {
    at?: string | Date;
    block?: number;
  };
  from?: string; // free text to be attached to this transfer
  hint?: string; // passcode hint for the recipient,
  id: string; // hints for the id generator in the format 'algorithm;data'
  owner: string; // owner id of this transaction, maxLength: 120, minLength: 20
  state: 'waiting-for-deposit' | 'retrieved' | 'ready' | 'collecting' | 'collected' | 'rejected' | 'invalid' | 'new';
  to: string; // the destination address,
  updatedAt: string | Date; // update date-time,
  transferFees?: TransferFees; // fees for this transfer
}

export interface TransferFees {
  kiro?: {
    from: string;
    value: string;
    v: string;
    r: string;
    s: string;
  };
  btc?: {
    to: string;
    value: number;
  };
}

export interface EventBusMessage {
  type: string;
  payload: unknown;
}

export type EventBus = (message: EventBusMessage) => void;

export interface EventBusProps {
  eventBus: EventBus;
  type: string;
}

export interface Results<T = unknown> {
  data: T[];
  limit: number;
  skip: number;
  total: number;
}

export type MessageCallback = (message: string, payload?: unknown) => void;

export interface EthTransferResponse {
  from: string;
  to: string;
  value: string;
  secretHash: string;
  publicSalt: string;
  createdAt: string;
  expiresAt: string;
  id: string;
  fees: string;
}
