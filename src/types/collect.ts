/**
 * Describes a request to collect transaction
 *
 * @interface
 * @name CollectRequest
 */
type CollectRequest = {
  id: string
  key: string
}

/**
 * Describes a Collectable object, received from API
 *
 * @interface
 * @name Collectable
 */
interface Collectable {
  amount: number // the transfer amount in satoshi
  collect: // collect information
  {
     broadcasted: number // block height at the moment the collect transaction has been broadcasted
    confirmed: number // block height at the moment the transaction has been confirmed
    txid: string // transaction ID
  }
  createdAt: string
  expires: { at?: string | Date; block?: number } // expiration details time/block height
  from?: string // 'from' note
  hint?: string // password hint
  id: string // generated inidividual ID of transaction record
  salt: string // salt is used to encrypt the 'collect' transaction
  state: 'ready' | 'collecting' | 'collected' // state of the transaction
  to: string // address of the recipient
  updatedAt: string
}

export { CollectRequest, Collectable }
