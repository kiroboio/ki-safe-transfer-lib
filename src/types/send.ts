/**
 * Describe request for sending a transaction
 *
 * @interface
 * @name SendRequest
 */
interface SendRequest {
  amount: number // the transfer amount in satoshi
  collect: string // collect raw transaction
  deposit?: string // deposit raw transaction
  depositPath?: string // deposit hd derived path
  from?: string // free text to be attached to this transfer
  hint?: string // passcode hint for the recipient
  id?: string // hints for the id generator in the format 'algorithm;data'
  owner?: string // owner id of this transaction, maxLength: 120, minLength: 20
  salt?: string // salt use to encrypt collect transaction
  to: string // the destination address
}

export { SendRequest }
