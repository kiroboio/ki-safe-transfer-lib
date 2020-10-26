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

interface BroadcastConfirmation {
  broadcasted: number
  confirmed: number
  txid: string
}
interface EthTransfer {
  collect: BroadcastConfirmation
  createdAt: string
  expires: {
    at: string
  }
  fees: string
  from: string
  id: string
  retrieve: BroadcastConfirmation
  salt: string
  secretHash: string
  state: string
  to: string
  updatedAt: string
  value: string
}

export type { EthNetworkItem, Contract, BroadcastConfirmation, EthTransfer }
