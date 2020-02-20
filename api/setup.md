## Setup


- [Why eventBus is always required?](#Why-eventBus-is-always-required)
- [Default settings](#Default-settings)
- [Options for settings](#Options-for-settings)
  - [debug](#_debug_)
  - [respondAs](#_respondAs_)
  - [eventBus](#_eventBus_)


The setup is plain simple:

```TypeScript
import Service, { Event } from '@kirobo/safe-transfer-lib'

try {

  const service = new Service() // nothing is required

} catch (e) {
  console.log('error: ', e.message)
}
 ```
 > Please, see [Default settings](#Default-settings) for details.

 > We strongly advise to handle library errors to catch helpful  messages that will help in development and production. More about this [here](errors.md#Errors-and-handling-them).

 or

```TypeScript
import Service, { Event } from '@kiroboio/safe-transfer-lib'

function eventBus(event: Event) {
  console.log('event fired: ', event)
}

try {

  const service = new Service({ eventBus })

} catch (e) {
  console.log('error: ', e.message)
}
 ```

> More about eventBus requirements and format is discussed [here](event_bus.md).


 or

 ```TypeScript
import Service, { DebugLevels, Currencies, Networks, Responses, Event } from '@kirobo/safe-transfer-lib'

function eventBus(event: Event) {
  console.log('event fired: ', event)
}

const serviceOptions = {
  debug: DebugLevels.QUIET,
  network: Networks.Testnet,
  currency: Currencies.Bitcoin,
  respond: Responses.Direct,
  eventBus
  }

try {

  const service = new Service(serviceOptions)

} catch (e) {
  console.log('error: ', e.message)
}
 ```

### Why [eventBus](event_bus.md) is always required?

Or almost always. [eventBus](event_bus.md) is used for event updates from the Kirobo server. Without it the functionality of the library is limited to one-way client-to-server actions without on-time updates.

The library can work in two modes - _direct reply_ and _use callback_:
- in _direct reply_ mode each function replies directly with answer or Error:

   ```TypeScript
   ...

   const service = new Service()

   async function run() {
     try {

       const result = await service.getStatus()
       console.log(result) // { height: 1664921, online: true, fee: 10000 }

     } catch (e) {
       console.log('error: ', e.message)
     }
   }

   run()
   ```

- _use callback_ is when all data responses go through [eventBus](event_bus.md), using Redux-friendly syntax (type/payload):

  > Please note, that for this mode [eventBus](event_bus.md) is required!

   ```TypeScript
   ...

   function eventBus(event: Event) {
     console.log('event fired: ', event)
     // event fired:  {
     //  type: 'service_update_status',
     //  payload: { height: 1664922, online: true, fee: 10000 }
     // }
   }

   const service = new Service({ respond: Responses.Callback, eventBus })

   async function run() {
     try {

       const result = await service.getStatus()
       console.log(result) // undefined

     } catch (e) {
       console.log('error: ', e.message)
     }
   }

   run()
   ```

### Default settings

Library comes with default settings. You can request the current settings (default or updated) with [getSettings()](#___getSettings()___) function:

 - [debug](#debug) - __1__ / _"quiet"_; _more about debug levels [here](#_Debug_)_;
 - currency - __btc__ / _Bitcoin_;
 - network - __testnet__ / _Testnet_;
 - version - __v1__ > current library is set to work with version 1 of Kirobo Retrievable Transfer API;
 - [respondAs](#respondAs) - __direct__ > functions to respond directly

### Options for settings

  #### _debug_

  Debug has three levels - verbose, quiet and mute:

  - __2__ or __verbose__ (default for development mode) - logs all responses from the server, as well as all the errors;
  - __1__ - __quiet__ (default for production mode) - logs only errors;
  - __0__ - __mute__ - doesn't show any information/errors;

  The level can be set definitely:

  ```TypeScript

  const service = new Service({ debug: DebugLevels.VERBOSE })

  ```

  or it will be set by default. The defaults are different, depending on __process.env.NODE_ENV__:

  - in _test_ mode, all logging is muted ( ```DebugLevels.MUTE``` )
  - in _development_ mode, all logging is on by default  ( ```DebugLevels.VERBOSE``` )
  - otherwise the default setting is to show errors only ( ```DebugLevels.QUIET``` )

  #### _respondAs_

  _respondAs_ allow to set the mode for the library to communicate with your application. There are two modes available:

  - _direct_ - all the responses will be returned back.

    > In this mode, no real-time event will be provided

  - _callback_ - in this mode, the library will only return data with non-async functions (please, see [API Endpoints](endpoints.md#API-Endpoints) section). All other data, including real-time updates will be sent through the [_eventBus_](#_eventBus_), which needs to be provided as separate option.

  #### _eventBus_

  [_eventBus_](#Why-eventBus-is-always-required) parameter requires callback function, which takes one argument - object of [Event type](). Details on how it is used are provided [above](#Why-eventBus-is-always-required).


