import {
  DebugLevels,
  Currencies,
  Networks,
  Responses,
  Watch,
  EventTypes,
  QueryOptions,
  BuyKiroWithEthRequest,
  EthTransferRequest,
} from '.';
import { RetrieveRequest } from './retrieve';
import { SendRequest } from './send';
import { CollectRequest } from './collect';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyValue = any;

type Either<T, K> = T | K;

type Maybe<T> = T | undefined | null;

interface AuthDetails {
  key: string;
  secret: string;
}

type Status = NetworkTip;

interface NetworkTip {
  height: number;
  online: boolean;
  netId: string;
  timestamp: number;
  fees: number[];
  fee: number;
  updatedAt: string | Date;
}

interface ApiService {
  find: (arg0?: unknown) => AnyValue;
  get: (arg0: unknown) => AnyValue;
  create: (
    arg0:
      | Record<string, unknown>
      | RetrieveRequest
      | SendRequest
      | CollectRequest
      | BuyKiroWithEthRequest
      | EthTransferRequest,
  ) => AnyValue;
  on: (arg0: string, arg1: (arg2: AnyValue) => AnyValue) => AnyValue;
}

type Event = {
  type: EventTypes;
  payload: unknown;
};
type EventBus = (event: Event) => void;

// TODO: do we need it?s
type Message = {
  text: string;
  isError: boolean;
  data?: unknown;
};

type Settings = {
  debug: DebugLevels;
  currency: Currencies;
  network: Networks;
  version: string;
  respondAs?: Responses;
};

/**
 * Describes lastAddresses object, which is props for getCollectables
 *
 * @interface
 * @enum LastAddresses
 */
interface LastAddresses {
  addresses: string[];
  options?: QueryOptions;
}

/**
 * Unspent transaction output (UTXO) fields
 *
 * @interface
 * @name Utxo
 */
interface Utxo {
  address: string;
  height: number;
  hex: string;
  type: 'SCRIPTHASH';
  txid: string;
  value: number;
  vout: number;
}

interface MinMax {
  min?: number;
  max?: number;
}

interface DataSpec {
  [key: string]: {
    type: string;
    required?: boolean;
    length?: MinMax;
  };
}

interface RawTransaction {
  txid: string;
  hex: string;
}

interface TransferFees {
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

export interface ConnectProps {
  authDetails: AuthDetails;
  eventBus?: EventBus;
  watch?: Watch;
}

export interface InstanceOptions {
  url?: string;
  withAuth?: boolean;
  globalNetwork?: Networks;
  globalCurrency?: Currencies;
  debug?: DebugLevels;
}

export type ServicesCollection = Record<string, Record<string, Record<string, ApiService>>>;

export interface RequestedService {
  request: ApiService;
  isNew: boolean;
}

export {
  AnyValue,
  Either,
  Maybe,
  LastAddresses,
  ApiService,
  AuthDetails,
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
  TransferFees,
};
