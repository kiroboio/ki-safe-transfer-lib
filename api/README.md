# API Documentation

## Contents

- [Terminology](#Terminology)
- [Setup](#Setup)
  - [Why eventBus is always required?](#Why-eventBus-is-always-required)
  - [Default settings](#Default-settings)
  - [Options for settings](#Options-for-settings)
    - [Debug](#Debug)
- [Errors and handling them](errors.md#Errors-and-handling-them)
- [API Endpoints](endpoints.md#API-Endpoints)
  - [_getSettings()_](endpoints.md#___getSettings()___)
  - [_clearLastAddresses()_]()
  - [async _getCollectables()_](endpoints.md#async-___getCollectables()___)
  - [async _getRetrievable()_](endpoints.md#async-___getRetrievable()___)
  - [async _send()_](endpoints.md#async-___send()___)
  - [async _collect()_](endpoints.md#async-___collect()___)
  - [async _getStatus()_](endpoints.md#async-___getStatus()___)


## Terminology





## Setup

The setup is plain simple:

```javascript
import Service, { Event } from '@kirobo/safe-transfer-lib'

try {

  const service = new Service() // nothing is required

} catch (e) {
  console.log(e.message)
}
 ```
 > Please, see [Default settings](#Default-settings) for details.

 > Always wrap library calls to catch helpful error messages. More about this [here](errors.md#Errors-and-handling-them).

 or

```javascript
import Service, { Event } from '@kiroboio/safe-transfer-lib'

function eventBus(event: Event) {
  console.log('event fired: ', event)
}

try {

  const service = new Service({ eventBus })

} catch (e) {
  console.log(e.message)
}
 ```

> More about eventBus requirements and format is discussed [here](event_bus.md).


 or

 ```javascript
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
  console.log(e.message)
}
 ```

### Why [eventBus](event_bus.md) is always required?

Or almost always. [eventBus](event_bus.md) is used for event updates from the Kirobo server. Without it the functionality of the library is limited to one-way client-to-server actions without on-time updates.

The library can work in two modes - _direct reply_ and _use callback_:
- in _direct reply_ mode each function replies directly with answer or Error:

   ```javascript
   ...

   const service = new Service({})

   async function run() {
     try {

       const result = await service.getStatus()
       console.log(result) // { height: 1664921, online: true, fee: 10000 }

     } catch (e) {
       console.log(e.message)
     }
   }

   run()
   ```

- _use callback_ is when all data responses go through [eventBus](event_bus.md), using Redux-friendly syntax (type/payload):

  > Please note, that for this mode [eventBus](event_bus.md) is required!

   ```javascript
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
       console.log(e.message)
     }
   }

   run()
   ```

### Default settings

Library comes with default settings. You can request the current settings (default or updated) with [getSettings()](#___getSettings()___) function:

 - debug - __1__ / _"quiet"_; _more about debug levels [here](#_Debug_)_;
 - currency - __btc__ / _Bitcoin_;
 - network - __testnet__ / _Testnet_;
 - version - __v1__ > current library is set to work with version 1 of Kirobo Safe Transfer API;
 - respond - __direct__ > functions to respond directly

### Options for settings

#### _Debug_

Debug has three levels - verbose, quiet and mute:

- __2__ or __verbose__ (default for development mode) - logs all responses from the server, as well as all the errors;
- __1__ - __quiet__ (default for production mode) - logs only errors;
- __0__ - __mute__ - doesn't show any information/errors;

