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

/*
 * Service types/messages to be used, when sending events
 *
 * @enum
 * @name EventTypes
 */
enum EventTypes {
  FOLLOW = 'kirobo_service_follow',
  BUY_KIRO = 'kirobo_service_buy_kiro',
  COLLECT_TRANSACTION = 'kirobo_service_collect_transaction',
  CONNECT = 'kirobo_service_connect',
  CREATED_COLLECTABLE = 'kirobo_service_created_collectable',
  DISCONNECT = 'kirobo_service_disconnect',
  ESTIMATE_FEES = 'kirobo_service_estimate_fees',
  ETH_TRANSFER_REQUEST = 'kirobo_service_eth_transfer_request',
  GET_BALANCE = 'kirobo_service_get_balance',
  GET_BTC_TO_USD_RATE = 'kirobo_service_get_btc_to_usd_rate',
  GET_BTC_TO_USD_RATES = 'kirobo_service_get_btc_to_usd_rates',
  GET_BY_OWNER_ID = 'kirobo_service_get_by_owner_id',
  GET_COLLECTABLES = 'kirobo_service_get_collectables',
  GET_IS_CONNECTED = 'kirobo_service_get_is_connected',
  GET_ETH_TO_USD_RATE = 'kirobo_service_get_eth_to_usd_rate',
  GET_ETH_TO_USD_RATES = 'kirobo_service_get_eth_to_usd_rates',
  GET_FRESH = 'kirobo_service_get_fresh',
  GET_KIRO_PRICE = 'kirobo_service_get_kiro_price',
  GET_KIRO_STATE = 'kirobo_service_get_kiro_state',
  GET_ONLINE_NETWORKS = 'kirobo_service_get_online_networks',
  GET_RAW_TRANSACTIONS = 'kirobo_service_get_raw_transactions',
  GET_RETRIEVABLE = 'kirobo_service_get_retrievable',
  GET_RETRIEVABLES = 'kirobo_service_get_retrievables',
  GET_TRANSFERS = 'kirobo_service_get_transfers',
  GET_USED = 'kirobo_service_get_used',
  GET_UTXOS = 'kirobo_service_get_utxos',
  REMOVED_COLLECTABLE = 'kirobo_service_removed_collectable',
  REMOVED_RETRIEVABLE = 'kirobo_service_removed_retrievable',
  RETRIEVE = 'kirobo_service_retrieve',
  SEND_TRANSACTION = 'kirobo_service_send_transaction',
  UPDATED_COLLECTABLE = 'kirobo_service_updated_collectable',
  UPDATED_RETRIEVABLE = 'kirobo_service_updated_retrievable',
  UPDATE_RATES = 'kirobo_service_update_btc_to_usd_rates',
  UPDATE_RATES_ETH = 'kirobo_service_update_eth_to_usd_rates',
  UPDATE_STATUS = 'kirobo_service_update_status',
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

export { Endpoints, EventTypes, Responses, Networks, Currencies, DebugLevels, Connection };
