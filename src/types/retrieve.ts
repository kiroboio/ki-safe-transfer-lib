interface Retrievable {
  amount: number
  collect: {
    broadcasted: number
    confirmed: number
    txid: string
  }
  createdAt: string
  deposit: {
    txid: string
    vout: number
    value: number
    address: string
    path?: string
  }
  expires: { at: string }
  from: string
  id: string
  state: string
  to: string
  updatedAt: string
  owner: string
}

interface Retrieve {
  id: string
  raw: string
}

export {Retrievable, Retrieve}