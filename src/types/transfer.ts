import { TransferFees } from './type'

interface Transfer {
  amount: number // the transfer amount in satoshi,minimum: 0
  collect: {
    broadcasted: number // blockchain height
    confirmed: number // block number of confirmed transaction
    txid: string // the tx id of the transaction
  }
  createdAt: string | Date // create date-time
  deposit: {
    address: string
    path?: string
    txid: string // the tx id of the transaction
    value: number
    vout: number
  }
  expires: {
    at?: string | Date
    block?: number
  }
  from?: string // free text to be attached to this transfer
  hint?: string // passcode hint for the recipient,
  id: string // hints for the id generator in the format 'algorithm;data'
  owner: string // owner id of this transaction, maxLength: 120, minLength: 20
  state: 'waiting-for-deposit' | 'retrieved' | 'ready' | 'collecting' | 'collected' | 'rejected' | 'invalid' | 'new'
  to: string // the destination address,
  updatedAt: string | Date // update date-time,
  transferFees?: TransferFees // fees for this transfer
}

interface EstimateFeeRequest {
  ownerId: string
  to: string
  amount: number
}

interface EstimatedFee {
  _id: string
  owner: string
  to: string
  amount: number
  createdAt: string
  expiresAt: string
  id: string
  fees: { satoshi: number; address: string; tokens: string }
}

interface EthTransferRequest {
  from: string;
  to: string;
  value: string;
  secretHash: string;
  publicSalt: string;
  privateSalt: string;
}

// {
//   "from": "(string: address)",
//   "to": "(string: address)",
//   "value": "(string: number)",
//   "secretHash": "(string: hex)",
//   "publicSalt": "(string)",
//   "createdAt": "(string: date)",
//   "expiresAt": "(string: date)",
//   "id": "(string: hex)",
//   "fees": "(string: number)"
// }
interface EthTransferResponse {
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

export type { Transfer, EstimateFeeRequest, EstimatedFee, EthTransferRequest, EthTransferResponse }
