interface Retrievable {
  amount: number // transfer amount
  collect: {
    // collect object, available only when collection has started
    broadcasted: number // block height at the moment the collect transaction has been broadcasted
    confirmed: number // block height at the moment the transaction has been confirmed
    txid: string // transaction ID
  }
  createdAt: string | Date
  deposit: {
    // deposit transaction details
    txid: string // deposit transaction ID
    vout: number // vector of output
    value: number // amount transferred
    address: string // address of deposit
    path?: string // derivation path
  }
  retrieve: {
    // retrieve transaction details
    broadcasted: number // block height at the moment the collect transaction has been broadcasted
    confirmed: number // block height at the moment the transaction has been confirmed
    txid: string // transaction ID
  }
  expires: { at?: string; block?: number } // expiration details time/block height
  from?: string // 'from' note
  hint?: string // password hint
  id: string // generated inidividual ID of transaction record
  state: string // state of the transaction
  to: string // address of the recipient
  updatedAt: string | Date
  owner: string // owner ID
}

interface RetrieveRequest {
  id: string
  raw: string
}

export { Retrievable, RetrieveRequest }
