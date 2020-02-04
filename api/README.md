# API Documentation

## Contents

- [Terminology](#Terminology)
- [Setup](#Setup)
  - [Why eventBus is always required?](#Why-eventBus-is-always-required?)
  - [Default settings](#Default-settings)
  - [Options for settings](#Options-for-settings)
    - [Debug](#Debug)
- [API Endpoints](./endpoints.md#API-Endpoints)
  - [_getSettings()_](./endpoints.md#___getSettings()___)
  - [async _getCollectables()_](./endpoints.md#async-___getCollectables()___)
  - [async _getRetrievable()_](./endpoints.md#async-___getRetrievable()___)
  - [async _send()_](./endpoints.md#async-___send()___)
  - [async _collect()_](./endpoints.md#async-___collect()___)
  - [async _getStatus()_](./endpoints.md#async-___getStatus()___)

## Terminology





## Setup

The setup is plain simple:

```javascript
import Service, { Event } from '@kirobo/safe-transfer-lib'

const service = new Service({})
 ```

 or

```javascript
import Service, { Event } from '@kirobo/safe-transfer-lib'

function eventBus(event: Event) {
  console.log('event fired: ', event)
}

const service = new Service({ eventBus })
 ```

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

const service = new Service(serviceOptions)
 ```

### Why `eventBus` is always required?

Or almost always. `eventBus` is used for event updates from the Kirobo server. Without it the functionality of the library is limited to one-way client-to-server actions without on-time updates.

The library can work in two modes - _direct reply_ and _use callback_:
- in _direct reply_ mode each function reply directly with answer or Error:

   ```javascript
   ...

   const service = new Service({})

   async function run() {
     try {
       const result = await service.getStatus()
       console.log(result) // { height: 1664921, online: true }
     } catch (e) {
       console.log(e.message)
     }
   }

   run()
   ```

- _use callback_ is when all data responses go through `eventBus`, using Redux-friendly syntax (type/payload):

  > Please note, that for this mode `eventBus` is required!

   ```javascript
   ...

   function eventBus(event: Event) {
     console.log('event fired: ', event)
     // event fired:  {
     //  type: 'service_update_status',
     //  payload: { height: 1664922, online: true }
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

