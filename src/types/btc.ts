/**
 * Describes the Bitcoin network details
 *
 * @interface
 * @name BtcNetworkItem
 */
interface BtcNetworkItem {
  height: number
  online: boolean
  netId: string
  timestamp: number
  fee: number
  updatedAt: string
}

export type { BtcNetworkItem }
