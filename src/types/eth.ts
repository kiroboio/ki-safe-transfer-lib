interface KiroState {
  address: string
  poolBalance: string
  ethBalance: string
  transactionCount: number
  debt: string
  externalBalance: string
  nonce: string
  pending: string
  releaseBlock: string
  secretHash: string
  withdrawal: string
}

interface KiroPrice {
  eth: { address: string; min: string; max: string; price: string }
  usd: { min: number; max: number; price: number }
  availableAt: string
  createdAt: string
  expiresAt: string
  recipient: string
}

interface Balance {
  address: string
  balance: string
  transactionCount: number
}

type RawTransaction = { raw: string }

interface BuyKiroWithEthRequest {
  eth: RawTransaction
}

export type { KiroState, KiroPrice, Balance, BuyKiroWithEthRequest }
