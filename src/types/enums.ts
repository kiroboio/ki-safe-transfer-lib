enum Endpoints {
  Collect = 'collect',
  Inbox = 'inbox',
  Transfers = 'transfers',
  Networks = 'networks',
  Utxos = 'utxos',
  Exists = 'exists',
  RateToUsd = 'to/usd',
  Retrieve = 'retrieve',
  Transactions = 'transactions',
  Kiros = 'kiros',
  KiroPrice = 'kiroPrice',
  EstimateFees = 'estimateFees',
  Balance = 'balance',
  KiroBuy = 'kiroBuy',
  EthTransferRequest = 'ethTransferRequest',
  Follow = 'follow',
}

// who the service should respond from methods:
// - callback - use provided callback
// - direct - respond directly
enum Responses {
  Callback = 'callback',
  Direct = 'direct',
}

enum EventTypes {
  FOLLOW = 'service_follow',
  BUY_KIRO = 'service_buy_kiro',
  COLLECT_TRANSACTION = 'service_collect_transaction',
  CONNECT = 'service_connect',
  CREATED_COLLECTABLE = 'service_created_collectable',
  DISCONNECT = 'service_disconnect',
  ESTIMATE_FEES = 'service_estimate_fees',
  ETH_TRANSFER_REQUEST = 'service_eth_transfer_request',
  GET_BALANCE = 'service_get_balance',
  GET_BTC_TO_USD_RATE = 'service_get_btc_to_usd_rate',
  GET_BTC_TO_USD_RATES = 'service_get_btc_to_usd_rates',
  GET_BY_OWNER_ID = 'service_get_by_owner_id',
  GET_COLLECTABLES = 'service_get_collectables',
  GET_CONNECTION_STATUS = 'service_get_connection_status',
  GET_ETH_TO_USD_RATE = 'service_get_eth_to_usd_rate',
  GET_ETH_TO_USD_RATES = 'service_get_eth_to_usd_rates',
  GET_FRESH = 'service_get_fresh',
  GET_KIRO_PRICE = 'service_get_kiro_price',
  GET_KIRO_STATE = 'service_get_kiro_state',
  GET_ONLINE_NETWORKS = 'service_get_online_networks',
  GET_RAW_TRANSACTIONS = 'service_get_raw_transactions',
  GET_RETRIEVABLE = 'service_get_retrievable',
  GET_RETRIEVABLES = 'service_get_retrievables',
  GET_TRANSFERS = 'service_get_transfers',
  GET_USED = 'service_get_used',
  GET_UTXOS = 'service_get_utxos',
  REMOVED_COLLECTABLE = 'service_removed_collectable',
  REMOVED_RETRIEVABLE = 'service_removed_retrievable',
  RETRIEVE = 'service_retrieve',
  SEND_TRANSACTION = 'service_send_transaction',
  UPDATED_COLLECTABLE = 'service_updated_collectable',
  UPDATED_RETRIEVABLE = 'service_updated_retrievable',
  UPDATE_RATES = 'service_update_btc_to_usd_rates',
  UPDATE_RATES_ETH = 'service_update_eth_to_usd_rates',
  UPDATE_STATUS = 'service_update_status',
}

enum Networks {
  // BTC
  Testnet = 'testnet',
  Regnet = 'regtest',
  Mainnet = 'main',
  // ETH
  Rinkeby = 'rinkeby',
}

enum Currencies {
  Bitcoin = 'btc',
  Ethereum = 'eth',
}

// debug:
// 0 - no reports to console
// 1 - only error reports to console
// 2 - verbose reporting level
enum DebugLevels {
  MUTE = 0,
  QUIET = 1,
  VERBOSE = 2,
}

/**
 * Connection actions
 *
 * @enum
 * @name Connection
 */
enum Connection {
  STATUS = 'status',
  ON = 'connect',
  OFF = 'disconnect',
}

export { Endpoints, EventTypes, Responses, Networks, Currencies, DebugLevels, Connection }
