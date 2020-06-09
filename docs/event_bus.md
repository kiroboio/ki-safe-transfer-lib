# eventBus

[◅ _return to documentation_](documentation.md)

eventBus feature is build with  [Flux](https://facebook.github.io/flux/docs/dispatcher) logic in mind. It uses provided callback function (for example, __dispatch__ one of [Redux](https://redux.js.org/api/store#dispatchaction)), capable of taking one object as argument. The object has only two keys: ```type``` and ```payload```. Type is a string, describing an event, starting with ```'service_'``` marker:

```TypeScript
enum EventTypes {
  COLLECT_TRANSACTION = 'service_collect_transaction',
  CONNECT = 'service_connect',
  CREATED_COLLECTABLE = 'service_created_collectable',
  DISCONNECT = 'service_disconnect',
  GET_BTC_TO_USD_RATE = 'service_get_btc_to_usd_rate',
  GET_BTC_TO_USD_RATES = 'service_get_btc_to_usd_rates',
  GET_BY_OWNER_ID = 'service_get_by_owner_id',
  GET_COLLECTABLES = 'service_get_collectables',
  GET_CONNECTION_STATUS = 'service_get_connection_status',
  GET_FRESH = 'service_get_fresh',
  GET_ONLINE_NETWORKS = 'service_get_online_networks',
  GET_RAW_TRANSACTIONS = 'service_get_raw_transactions',
  GET_RETRIEVABLE = 'service_get_retrievable',
  GET_RETRIEVABLES = 'service_get_retrievables',
  GET_USED = 'service_get_used',
  GET_UTXOS = 'service_get_utxos',
  REMOVED_COLLECTABLE = 'service_removed_collectable',
  REMOVED_RETRIEVABLE = 'service_removed_retrievable',
  RETRIEVE = 'service_retrieve',
  SEND_TRANSACTION = 'service_send_transaction',
  UPDATE_STATUS = 'service_update_status',
  UPDATED_COLLECTABLE = 'service_updated_collectable',
  UPDATED_RETRIEVABLE = 'service_updated_retrievable',
}

```
The payload value can be of any type, depending on data sent by the server/library or lack of. Once a new connection is established (new instance of library is set), the first event sent is status update:

```TypeScript
import Service, { Responses, Event } from '@kiroboio/safe-transfer-lib'

function eventBus(event: Event) {
  console.log('event fired: ', event)

  //  event fired:  {
  //  type: 'service_update_status',
  //  payload:
  //    { height: 1764130,
  //      online: true,
  //      netId: 'testnet',
  //      timestamp: 1591691849,
  //      fees: [ 999, 999, 999, 999, 999, 999, 999, 999, 999, 999 ],
  //      fee: 1048,
  //      updatedAt: '2020-06-09T08:36:49.535Z' } }
  //  }
}

const service = Service.getInstance({
  respondAs: Responses.Callback,
  eventBus
  }, true)

```
From now on, the updates of status and/or regarding transactions will be coming automatically only in case use of [Watch](query_options.md#watch) parameter in query options.

eventBus will be receiving all results of async functions, as well as events, connected to [watched](query_options.md#watch) transactions or events.

To use the eventBus feature, two settings has to be set - ```respondAs``` and ```eventBus```. ```respondAs``` should have ```Responses.Callback``` if you use TypeScript or ```'callback'``` if you use JavaScript. Callback response setting can be overridden for each individual request with a [respondDirect](query_options.md#respondDirect) parameter (where applicable).

[⬑ _to top_](#eventbus)

[◅ _return to documentation_](documentation.md)