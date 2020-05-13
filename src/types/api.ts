/**
 * Base interface for Results, providing the pagination details
 *
 * @interface
 * @name Paging
 */
interface Paging {
  total: number
  skip: number
  limit: number
}

/**
 * Describes the data getter results.
 *
 * @interface
 * @name Results
 * @param T - type of data array content
 */
interface Results<T> extends Paging {
  data: Array<T>
}

/**
 * Paging options for query and response type override
 *
 * @interface
 * @name QueryOptions
 */
interface QueryOptions {
  limit?: number
  skip?: number
  respondDirect?: boolean
}

/**
 * Describes the network details
 *
 * @interface
 * @name NetworkItem
 */
interface NetworkItem {
  height: number
  online: boolean
  netId: string
  timestamp: number
  fee: number
  updatedAt: string
}

interface Address {
  address: string
}

export { Address, NetworkItem, QueryOptions, Results, Paging }
