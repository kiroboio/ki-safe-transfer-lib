import { BtcNetworkItem, Currencies, EthNetworkItem, Networks } from '.';

/**
 * Base interface for Results, providing the pagination details
 *
 * @interface
 * @name Paging
 */
interface Paging {
  total: number;
  skip: number;
  limit: number;
}

/**
 * Describes the data getter results.
 *
 * @interface
 * @name Results
 * @param T - type of data array content
 */
interface Results<T> extends Paging {
  data: Array<T>;
}

/**
 * List of 'watch' options
 *
 * @enum
 * @name Watch
 */
export enum Watch {
  DISABLE = 'disable', // to cancel all subscriptions (was ’none’ before) - this is the default behavior when watch param does not exist
  ADD = 'add', // to add this query to the existing subscriptions (or create a new subscription for the current query when there is none)
  REPLACE = 'replace', // to remove old subscriptions and create a new subscription for the current query
  IGNORE = 'ignore', // the current query won’t affect the existing subscription
}

/**
 * Describes request options
 *
 * @interface
 * @name RequestOptions
 */
export interface RequestOptions {
  respondDirect?: boolean;
  watch?: Watch;
  network?: Networks;
  currency?: Currencies;
}

/**
 * Paging options for query and response type override
 *
 * @interface
 * @name QueryOptions
 */
interface QueryOptions extends RequestOptions {
  limit?: number;
  skip?: number;
}

interface Address {
  address: string;
}

type OnlineNetworkResults = Results<BtcNetworkItem | EthNetworkItem>;

interface TxHash {
  txHash: string;
}

interface Txid {
  txid: string;
}

export type { Txid, Address, TxHash, QueryOptions, Results, Paging, OnlineNetworkResults };
