const endpoints: Record<string, string> = {
  collect: 'transfer/action/collect',
  retrieve: 'transfer/action/retrieve',
  inbox: 'transfer/inbox',
  transfers: 'transfers',
  utxos: 'utxos',
  exists: 'exists',
} as const