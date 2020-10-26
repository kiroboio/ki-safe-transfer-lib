/**
 * Describes contract object
 *
 * @interface
 * @name Contract
 */
interface Contract {
  address: string
  synced: true
}

/**
 * Describes the network details for Ethereum
 *
 * @interface
 * @name EthNetworkItem
 */
interface EthNetworkItem {
  height: number
  online: boolean
  netId: string
  timestamp: number
  updatedAt: string
  contracts: Record<string, Contract>
}

export type { EthNetworkItem, Contract }
