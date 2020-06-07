# Setup
[◅ _return home_](api.md#api-documentation)

## Contents

- [Setting things up](#setting-things-up)
- [Why eventBus is always required?](#why-eventbus-is-always-required)
- [Default settings](#default-settings)
- [Options for settings](#options-for-settings)
  - [authDetails](#authDetails)
  - [currency](#currency)
  - [debug](#debug)
  - [eventBus](#eventbus)
  - [network](#network)
  - [respondAs](#respondas)

## Setting things up

The setup is plain simple:

```TypeScript
import Service, { Event } from '@kirobo/safe-transfer-lib'

const authDetails = {key: process.env.AUTH_KEY, secret: process.env.AUTH_SECRET}

try {

  const service = Service.getInstance({ authDetails }, true))

} catch (e) {
  console.log('error: ', e.message)
}
 ```

> Error handling has to be provided to catch error messages that will help in development and production. More about this [here](errors.md#errors-and-handling-them).

Service is using simple instance management to ensure that it is running only one connection at a time. ```getInstance()``` method takes two arguments:

- object as _ConnectProps_
- replace instance request, optional

_ConnectProps_ are:

```TypeScript

interface ConnectProps {
  debug?: DebugLevels // logging level (via console);
  currency?: Currencies // currency;
  network?: Networks // network for the currency;
  authDetails: AuthDetails // authentication details - key, secret;
  eventBus?: EventBus // event bus to send events and data through¹;
  respondAs?: Responses // default response method - direct or through callback (if event bus was provided);
  watch?: Watch // default watch (subscribe) method²;
}

```

> ¹ Event bus implementation is built with [Flux](https://facebook.github.io/flux/docs/dispatcher) logic in mind.

 > ² Please, see [Watch](watch.md) for details on ```watch``` feature.

 > Please, see [Default settings](#default-settings) for details on defaults.

 or

```TypeScript
import Service, { Event } from '@kiroboio/safe-transfer-lib'

const authDetails = {key: process.env.AUTH_KEY, secret: process.env.AUTH_SECRET}

function eventBus(event: Event) {
  console.log('event fired: ', event)
}

try {

  const service = Service.getInstance({
    respondAs: Responses.Callback,
    eventBus,
    authDetails,
    })

} catch (e) {
  console.log('error: ', e.message)
}
 ```

> More about eventBus requirements and format is discussed [here](event_bus.md#eventbus).

 or

 ```TypeScript
import Service, { DebugLevels, Currencies, Networks, Responses, Event } from '@kirobo/safe-transfer-lib'

const authDetails = {key: process.env.AUTH_KEY, secret: process.env.AUTH_SECRET}

const serviceOptions = {
  debug: DebugLevels.QUIET,
  network: Networks.Testnet,
  currency: Currencies.Bitcoin,
  respondAs: Responses.Direct,
  authDetails
  }

try {

  const service = Service.getInstance(serviceOptions)

} catch (e) {
  console.log('error: ', e.message)
}
 ```

[⬑ _to top_](#setup)

## Why [eventBus](event_bus.md#eventbus) is always required?

Or almost always. [eventBus](event_bus.md#eventbus) is used for event updates from the Kirobo server. Without it the functionality of the library is limited to one-way client-to-server actions without on-time updates.

The library can work in two modes - _direct reply_ and _use callback_:
- in _direct reply_ mode each function replies directly with answer or Error:

   ```TypeScript
   ...

   const service = new Service({ authDetails })

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

- _use callback_ is when all data responses go through [eventBus](event_bus.md#eventbus), using Redux-friendly syntax (type/payload):

  > Please note, that for this mode [eventBus](event_bus.md#eventbus) is required!

   ```TypeScript
   ...

   function eventBus(event: Event) {
     console.log('event fired: ', event)
     // event fired:  {
     //  type: 'service_update_status',
     //  payload: {
     //     height: 1747254,
     //     online: true,
     //     netId: 'testnet',
     //     timestamp: 1591102463,
     //     fee: 999,
     //     updatedAt: '2020-06-02T12:54:15.856Z' }
     //   }
   }

   const service = new Service({ respond: Responses.Callback, eventBus, authDetails })

   async function run() {
     try {

       const result = await service.getStatus()
       console.log(result) //

     } catch (e) {
       console.log('error: ', e.message)
     }
   }

   run()
   ```

There is an way to override the system-wide setting of ```respond``` per method:

```TypeScript
   ...

   function eventBus(event: Event) {
     console.log('event fired: ', event) //
   }

   const service = new Service({ respond: Responses.Callback, eventBus, authDetails })

   async function run() {
     try {

       const result = await service.getStatus({ respondDirect: true })
       console.log(result)
       // {
       //   height: 1747245,
       //   online: true,
       //   netId: 'testnet',
       //   timestamp: 1591101501,
       //   fee: 999,
       //   updatedAt: '2020-06-02T12:38:33.868Z'
       //  }

     } catch (e) {
       console.log('error: ', e.message)
     }
   }

   run()
   ```
> More about QueryOptions is covered [here](query_options.md#query-options).

[⬑ _to top_](#setup)

## Default settings

Library comes with default settings. You can request the current settings (default or updated) with [getSettings()](endpoints.md#getSettings) function:

 - [debug](#debug) - __1__ / _"quiet"_; _more about debug levels [here](#debug)_;
 - currency - __btc__ / _Bitcoin_;
 - network - __testnet__ / _Testnet_;
 - version - __v1__ > current library is set to work with version 1 of Kirobo Retrievable Transfer API;
 - [respondAs](#respondas) - __direct__ > functions to respond directly

[⬑ _to top_](#setup)

## Options for settings

  ### _authDetails_

  _authDetails_ parameter provides data for authentication. Data is an object with two keys: _key_ (string) and _secret_ (string). These two elements make up an API key. It is the only mandatory setting for the library.

  [⬑ _to top_](#setup)

  ### _currency_

  _currency_ is used to choose the currency. For example: ```Currencies.Bitcoin``` for _BitCoin_. The enum with options is exported from the library.

  [⬑ _to top_](#setup)

  ### _debug_

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

  The enum with options is exported from the library.

  [⬑ _to top_](#setup)

  ### _eventBus_

  [_eventBus_](#why-eventbus-is-always-required) parameter requires callback function, which takes one argument - object of [Event type](event_bus.md#eventbus). Details on how it is used are provided [above](#why-eventbus-is-always-required).

  [⬑ _to top_](#setup)

  ### _network_

  _network_ is used to set the working blockchain network for the currency. For example: ```Networks.Testnet``` for _testnet_. The enum with options is exported from the library.

  [⬑ _to top_](#setup)

  ### _respondAs_

  _respondAs_ allow to set the mode for the library to communicate with your application. There are two modes available:

  - _direct_ - all the responses will be returned back.

    > In this mode, no real-time event will be provided

  - _callback_ - in this mode, the library will only return data with non-async functions (please, see [API Endpoints](endpoints.md#api-endpoints) section). All other data, including real-time updates will be sent through the [_eventBus_](event_bus.md#eventbus), which needs to be provided as separate option.

  The enum with options is exported from the library.

  [⬑ _to top_](#setup)

[◅ _return home_](api.md#api-documentation)