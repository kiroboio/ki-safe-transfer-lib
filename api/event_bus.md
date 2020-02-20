# eventBus
[◅ _return home_](README.md#Kirobo-Retrievable-Transfer-Library-Documentation)

eventBus feature is using provided function, capable of taking one object as argument. The object has only two keys: ```type``` and ```payload```. Type is a text description of an event, starting with ```'service_'``` marker:

```TypeScript
export enum EventTypes {
  GET_RETRIEVABLE = 'service_get_retrievable',
  GET_COLLECTABLES = 'service_get_collectables',
  UPDATE_STATUS = 'service_update_status',
  SEND_TRANSACTION = 'service_send_transaction',
  COLLECT_TRANSACTION = 'service_collect_transaction',
  UPDATED_RETRIEVABLE = 'service_updated_retrievable',
  REMOVED_RETRIEVABLE = 'service_removed_retrievable',
  UPDATED_COLLECTABLE = 'service_updated_collectable',
  REMOVED_COLLECTABLE = 'service_removed_collectable',
  CREATED_COLLECTABLE = 'service_created_collectable',
  SEND_MESSAGE = 'service_message',
}
```
The payload value can be of any type, depending on data sent by the server or lack of. Once a new connection is established (new instance of library is set), the first event sent is status update:

```TypeScript
import Service, { Responses, Event } from '@kiroboio/safe-transfer-lib'

const service = new Service({
  respondAs: Responses.Callback,
  eventBus
  })

function eventBus(event: Event) {
  console.log('event fired: ', event)

  //  event fired:  {
  //  type: 'service_update_status',
  //  payload: { height: 1666319, online: true, fee: 3073 }
  //  }
}
```
From now on, the status updates will be coming automatically, with each new block on the blockchain or when the service reconnects after connection drop.

eventBus will be receiving all result of async functions, as well as events, connected to [subscribed](how_does_it_work.md#Subscription) transactions.

To use the eventBus feature, two settings has to be set - ```respondAs``` and ```eventBus```. ```respondAs``` should have ```Responses.Callback``` if you use TypeScript or ```'callback'``` if you use JavaScript.

[⬑ _to top_](#eventBus)

[◅ _return home_](README.md#Kirobo-Retrievable-Transfer-Library-Documentation)