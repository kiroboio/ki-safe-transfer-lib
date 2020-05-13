type CollectRequest = {
  id: string
  key: string
}

 type Collectable = {
  amount: number
  collect: { broadcasted: number; confirmed: number; txid: string }
  createdAt: string
  expires: { at: string }
  from?: string
  hint?: string
  id: string
  salt: string
  state: string
  to: string
  updatedAt: string
}

export {CollectRequest,Collectable}