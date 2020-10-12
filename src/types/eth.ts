interface KiroState {
  address: string
  balance: string
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

export type { KiroState,KiroPrice }
