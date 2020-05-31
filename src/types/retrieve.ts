interface Retrievable {
  amount: number
  collect: {
    broadcasted: number
    confirmed: number
    txid: string
  }
  createdAt: string | Date
  deposit: {
    txid: string
    vout: number
    value: number
    address: string
    path?: string
  }
  retrieve: {
    broadcasted: number
    confirmed: number
    txid: string
  }
  expires: { at?: string; block?: number }
  from?: string
  hint?: string
  id: string
  state: string
  to: string
  updatedAt: string | Date
  owner: string
}


interface RetrieveRequest {
  id: string
  raw: string
}

export { Retrievable, RetrieveRequest }
