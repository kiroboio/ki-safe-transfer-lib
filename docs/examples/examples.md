# Example Code

[◅ _return home_](../README.md)

## Contents

- [Get settings & connect](#get-settings-connect)
  - [Settings](#settings)
  - [Connect](#connect)
- [Update status](#update-status)
  - [Direct response](#direct-response)
- [Get exchange rates](#get-exchange-rates)
  - [Single source](#single-source)
- [Working with UTXOs](utxos.md#contents)
  - [Get UTXOs](utxos.md#get-utxos)
  - [Get fresh UTXOs](utxos.md#get-fresh-utxos)
  - [Get used UTXOs](utxos.md#get-used-utxos)
- [Sending transaction](send.md)
- [Get all transfers by owner ID](#get-all-transfers-by-owner-id)
- [Get collectable transactions](#get-collectable-transactions)
- [Collecting transaction](collect.md)
- [Retrieving transaction](retrieve.md)
- [React app with Redux](react.md#react-app-with-redux)

## Get settings, connect


### Settings

Library have several method, not connected to the API responses: get stored settings, manual connect and disconnect of the socket connection:

```TypeScript
// library to load environment variables from .env file
import dotenv from 'dotenv'

// import required class, types and tool
import Service, { Responses, Event, DebugLevels, wait } from '@kiroboio/safe-transfer-lib'

// configure the library
dotenv.config()

// get authentication details
const authDetails = { key: process.env.AUTH_KEY || '', secret: process.env.AUTH_SECRET || '' }

// configure Kirobo API service library
const service = Service.getInstance(
  {
    debug: DebugLevels.QUIET, // minimize the console logging
    authDetails, // authentication details
  },
  true, //  replace previous instances
)

// main function
async function run(): Promise<void> {
  // set a delay to allow the service proceed with initial connection, and authorization
  await wait(2000)

  try {
  // request settings for instance
  const response = service.getSettings()
  console.log(response)
  } catch (err) {
    console.log(err)
  }
}

// run the main function
run()
```

_getSettings()_ responds only directly and provided the settings for current instance:

```TypeScript
{
  authDetails: true, // authentication details are present
  currency: 'btc', // blockchain currency
  debug: 1, // debug levels 0-2, limiting the amount console logs
  eventBus: true, // eventBus callback function is provided
  lastAddresses: { addresses: [] }, // cached addresses, used in last call for collectable transaction
  network: 'testnet', // blockchain network for the currency
  respondAs: 'callback', // global respond setting
  version: 'v1' // API version
}
```
> ☝Caching of addresses is required to automatically perform  re-check for collectable transactions following the connection reestablished after disconnect.

[⬑ _to top_](#contents)

### Connect

_connect()_ method is provided for additional flexibility in working with library. It works in auto-mode, but in case you want to perform manual connection operation you can easily do it:

```TypeScript
// library to load environment variables from .env file
import dotenv from 'dotenv'

// import required class, types and tool
import Service, { Responses, Event, DebugLevels, wait } from '@kiroboio/safe-transfer-lib'

// configure the library
dotenv.config()

// get authentication details
const authDetails = { key: process.env.AUTH_KEY || '', secret: process.env.AUTH_SECRET || '' }

// configure Kirobo API service library
const service = Service.getInstance(
  {
    debug: DebugLevels.QUIET, // minimize the console logging
    authDetails, // authentication details
  },
  true, //  replace previous instances
)

// main function
async function run(): Promise<void> {
  // set a delay to allow the service proceed with initial connection, and authorization
  await wait(2000)

  try {
  // call to connect
  service.connect()
  } catch (err) {
    console.log(err)
  }
}

// run the main function
run()
```

[⬑ _to top_](#contents)

## Update status

Request block height, online status, network ID, average fee of the last block. Authentication request key/secret pair, which can be obtain either through ```.env``` file (we are going to use this way further on):

```TypeScript
// library to load environment variables from .env file
import dotenv from 'dotenv'

 // import required class, types and tool
import Service, { Responses, Event, DebugLevels, wait, Watch } from '@kiroboio/safe-transfer-lib'

// configure the library
dotenv.config()

// get authentication details
const authDetails = { key: process.env.AUTH_KEY || '', secret: process.env.AUTH_SECRET || '' }

// setup eventBus to process the event, coming from the API
function eventBus(event: Event): void {
  // here were are just displaying the event
  console.dir(event, { depth: 15, colors: true, compact: true })
}

// configure Kirobo API service library
const service = Service.getInstance(
  {
    debug: DebugLevels.QUIET, // minimize the console logging
    respondAs: Responses.Callback, // send feedback and events through callback function, i.e. eventBus
    eventBus, // providing the function for eventBus
    authDetails, // authentication details
  },
  true, //  replace previous instances
)

// main function
async function run(): Promise<void> {
  // set a delay to allow the service proceed with initial connection, and authorization
  await wait(2000)

  try {
  // request status update and add it to 'watch' list, to receive further updates via eventBus
  service.getStatus({ watch: Watch.ADD })
  } catch (err) {
    console.log(err)
  }
}

// run the main function
run()
```

or importing from config file:

```TypeScript

import Service, { Responses, Event, DebugLevels, wait, Watch } from '@kiroboio/safe-transfer-lib'

// get configuration for file
import { CONFIG } from './env_config'

// set authentication details
const authDetails = { key: CONFIG.AUTH_KEY, secret: CONFIG.AUTH_SECRET }
// setup eventBus to process the event, coming from the API
function eventBus(event: Event): void {
  // here were are just displaying the event
  console.dir(event, { depth: 15, colors: true, compact: true })
}

// configure Kirobo API service library
const service = Service.getInstance(
  {
    debug: DebugLevels.QUIET, // minimize the console logging
    respondAs: Responses.Callback, // send feedback and events through callback function, i.e. eventBus
    eventBus, // providing the function for eventBus
    authDetails, // authentication details
  },
  true, //  replace previous instances
)

// main function
async function run(): Promise<void> {
  // set a delay to allow the service proceed with initial connection, and authorization
  await wait(2000)

  try {
  // request status update and add it to 'watch' list, to receive further updates via eventBus
  service.getStatus({ watch: Watch.ADD })
  } catch (err) {
    console.log(err)
  }
}

// run the main function
run()

```

On the initial connection (when we __replace__ instance), library will automatically request status update, but it will not add it to [watch](../query_options.md#watch) list. It is done in this way so you can decide whether you want to 'watch' it or not. Without __eventBus__ callback function provided no real-time updates can be provided, such as transaction state updates, collection/retrieving information update and others.

 [⬑ _to top_](#contents)

#### Direct response

The data can be requested with direct response:

```TypeScript
// library to load environment variables from .env file
import dotenv from 'dotenv'

 // import required class, types and tool
import Service, { Responses, Event, DebugLevels, wait } from '@kiroboio/safe-transfer-lib'

// configure the library
dotenv.config()

// get authentication details
const authDetails = { key: process.env.AUTH_KEY || '', secret: process.env.AUTH_SECRET || '' }

// setup eventBus to process the event, coming from the API
function eventBus(event: Event): void {
  // here were are just displaying the event
  console.dir(event, { depth: 15, colors: true, compact: true })
}

// configure Kirobo API service library
const service = Service.getInstance(
  {
    debug: DebugLevels.QUIET, // minimize the console logging
    respondAs: Responses.Callback, // send feedback and events through callback function, i.e. eventBus
    eventBus, // providing the function for eventBus
    authDetails, // authentication details
  },
  true, //  replace previous instances
)

// main function
async function run(): Promise<void> {
  // set a delay to allow the service proceed with initial connection, and authorization
  await wait(2000)

  try {
  // request status update with direct response (won't affect the global setting above)
  const response = await service.getStatus({ respondDirect: true })
  console.log('response',response)
  // this is the result you will get:
  //
  // response {
  //   height: 1747690,
  //   online: true,
  //   netId: 'testnet',
  //   timestamp: 1591258377,
  //   fee: 100634,
  //   updatedAt: '2020-06-04T08:12:58.753Z'
  // }
  } catch (err) {
    console.log(err)
  }

}

// run the main function
run()
```
[⬑ _to top_](#contents)

### Get exchange rates

You can request exchange rates for BTC (currently to USD only) from 3 sources or any one of them:

```TypeScript
// library to load environment variables from .env file
import dotenv from 'dotenv'

// import required class, types and tool
import Service, { Responses, Event, DebugLevels, wait } from '@kiroboio/safe-transfer-lib'

// configure the library
dotenv.config()

// get authentication details
const authDetails = { key: process.env.AUTH_KEY || '', secret: process.env.AUTH_SECRET || '' }

// setup eventBus to process the event, coming from the API
function eventBus(event: Event): void {
  // here were are just displaying the event
  console.dir(event, { depth: 15, colors: true, compact: true })
}

// configure Kirobo API service library
const service = Service.getInstance(
  {
    debug: DebugLevels.QUIET, // minimize the console logging
    respondAs: Responses.Callback, // send feedback and events through callback function, i.e. eventBus
    eventBus, // providing the function for eventBus
    authDetails, // authentication details
  },
  true, //  replace previous instances
)

// main function
async function run(): Promise<void> {
  // set a delay to allow the service proceed with initial connection, and authorization
  await wait(2000)

  try {
  // request exchange rates from all available sources
  service.getRates()
  } catch (err) {
    console.log(err)
  }
}

// run the main function
run()
```

_eventBus_ will receive the following:

```TypeScript
{
  type: 'service_get_btc_to_usd_rates',
  payload:
    { total: 3,
      limit: 100,
      skip: 0,
      data:
      [
        { source: 'coingecko.com', timestamp: 1591265280, online: true, value: 9540.962 },
        { source: 'blockchain.info', timestamp: 1591265280, online: true, value: 9534.79 },
        { source: 'bitfinex.com', timestamp: 1591265280, online: true, value: 9543.8 }
      ]
    }
}
```

You can utilize [paging](../query_options.md#paging) options to narrow down the results:

```TypeScript
service.getRates({ limit: 2, skip: 1 })
```
or add it to a [watch](../query_options.md#watch) list to get updates:
```TypeScript
service.getRates({ limit: 2, skip: 1, watch: Watch.ADD })
```

_eventBus_ will get the following:

```TypeScript
{
  type: 'service_get_btc_to_usd_rates',
  payload:
   { total: 3,
     limit: 2,
     skip: 1,
     data:
      [
        { source: 'blockchain.info', timestamp: 1591266780, online: true, value: 9535.32 },
        { source: 'bitfinex.com', timestamp: 1591266780, online: true, value: 9537.849376 }
      ]
   }
}
```
[⬑ _to top_](#contents)

#### Single source

You can get the rates updates from a selected source only:

```TypeScript
// library to load environment variables from .env file
import dotenv from 'dotenv'

// import required class, types and tool
import Service, { Responses, Event, DebugLevels, wait, Watch, RatesSources } from '@kiroboio/safe-transfer-lib'

// configure the library
dotenv.config()

// get authentication details
const authDetails = { key: process.env.AUTH_KEY || '', secret: process.env.AUTH_SECRET || '' }

// setup eventBus to process the event, coming from the API
function eventBus(event: Event): void {
  // here were are just displaying the event
  console.dir(event, { depth: 15, colors: true, compact: true })
}

// configure Kirobo API service library
const service = Service.getInstance(
  {
    debug: DebugLevels.QUIET, // minimize the console logging
    respondAs: Responses.Callback, // send feedback and events through callback function, i.e. eventBus
    eventBus, // providing the function for eventBus
    authDetails, // authentication details
  },
  true, //  replace previous instances
)

// main function
async function run(): Promise<void> {
  // set a delay to allow the service proceed with initial connection, and authorization
  await wait(2000)

  try {
  // request exchange rates from preferred source
  service.getRate({ source: RatesSources.COINGECKO, options: { watch: Watch.ADD } })
  } catch (err) {
    console.log(err)
  }
}

// run the main function
run()
```
You will be getting the following event:

```TypeScript
{
  type: 'service_get_btc_to_usd_rate',
  payload:
   { source: 'coingecko.com', timestamp: 1591266540, online: true, value: 9533.772 }
}
```

> ☝If your preferred source is BitFinex, then you don't have to specify it, as it is a default one:

```TypeScript
service.getRate({ options: { watch: Watch.ADD } })
```

[⬑ _to top_](#contents)

## Get all transfers by owner ID

Get all transactions sent with a certain owner ID:

```TypeScript
// library to load environment variables from .env file
import dotenv from 'dotenv'

// import required class, types and tool
import Service, { Responses, Event, DebugLevels, wait } from '@kiroboio/safe-transfer-lib'

// configure the library
dotenv.config()

// get authentication details
const authDetails = { key: process.env.AUTH_KEY || '', secret: process.env.AUTH_SECRET || '' }

// setup eventBus to process the event, coming from the API
function eventBus(event: Event): void {
  // here were are just displaying the event
  console.dir(event, { depth: 15, colors: true, compact: true })
}

// configure Kirobo API service library
const service = Service.getInstance(
  {
    debug: DebugLevels.QUIET, // minimize the console logging
    respondAs: Responses.Callback, // send feedback and events through callback function, i.e. eventBus
    eventBus, // providing the function for eventBus
    authDetails, // authentication details
  },
  true, //  replace previous instances
)

// main function
async function run(): Promise<void> {
  // set a delay to allow the service proceed with initial connection, and authorization
  await wait(2000)

  try {
  // get all transactions with the owner ID
  service.getByOwnerId(
    'xxxxx',
  )
  } catch (err) {
    console.log(err)
  }
}

// run the main function
run()
```

Event bus will get [Results](results.md) object with [paging](../query_options.md#paging) details and with array of transactions or empty array if non has been found:

```TypeScript
{ type: 'service_get_by_owner_id',
  payload:
   { total: 1,
     limit: 100,
     skip: 0,
     data:
      [ { amount: 100000,
          collect: {},
          createdAt: '2020-06-07T08:02:34.695Z',
          deposit:
           { txid: 'aaaaaa',
             vout: 0,
             value: 100744,
             address: 'bbbbb',
             path: "derivation_path" },
          expires: { at: '2020-06-07T20:02:34.695Z' },
          from: 'Kirobo',
          id: 'yyyyy',
          retrieve: { broadcasted: -1, confirmed: -1, txid: '' },
          state: 'ready',
          to: 'zzzzz',
          updatedAt: '2020-06-07T08:02:34.759Z',
          owner:
           'xxxxx'
        }
      ]
   }
}
```
> Transaction type is [Retrievable](../how_does_it_work.md#retrievable-type).

You can use [paging](../query_options.md#paging) and [watch](../query_options.md#watch) options with this request:

```TypeScript
service.getByOwnerId(
  '045492ca4eb8d15bce952d615d099b3bfb543426432a8f968ecf2209bd222321763e9e801b32ce51238df38dbe83d94f2999f3',
  { limit: 1, watch: Watch.ADD },
)
```
[⬑ _to top_](#contents)

### Get collectable transactions

To get all collectables transactions for an address or addresses, simply send a request:

```TypeScript
// library to load environment variables from .env file
import dotenv from 'dotenv'

// import required class, types and tool
import Service, { Responses, Event, DebugLevels, wait, Watch } from '@kiroboio/safe-transfer-lib'

// configure the library
dotenv.config()

// get authentication details
const authDetails = { key: process.env.AUTH_KEY || '', secret: process.env.AUTH_SECRET || '' }

// setup eventBus to process the event, coming from the API
function eventBus(event: Event): void {
  // here were are just displaying the event
  console.dir(event, { depth: 15, colors: true, compact: true })
}

// configure Kirobo API service library
const service = Service.getInstance(
  {
    debug: DebugLevels.QUIET, // minimize the console logging
    respondAs: Responses.Callback, // send feedback and events through callback function, i.e. eventBus
    eventBus, // providing the function for eventBus
    authDetails, // authentication details
  },
  true, //  replace previous instances
)

// main function
async function run(): Promise<void> {
  // set a delay to allow the service proceed with initial connection, and authorization
  await wait(2000)

  try {
  // get all transactions sent to address(es)
  service.getCollectables(['xxxxx'])
  } catch (err) {
    console.log(err)
  }
}

// run the main function
run()
```
The event bus function will receive [Results](results.md) object with [paging](../query_options.md#paging) details and with array of collectable transactions:

```TypeScript
{ type: 'service_get_collectables',
  payload:
   { total: 1,
     limit: 100,
     skip: 0,
     data:
      [ { amount: 100000,
          collect: {},
          createdAt: '2020-06-07T08:02:34.771Z',
          expires: { at: '2020-06-07T20:02:34.695Z' },
          from: 'Kirobo',
          id: 'aaaaa',
          salt: 'bbbbb',
          state: 'ready',
          to: 'xxxxx',
          updatedAt: '2020-06-07T08:02:34.771Z'
        }
      ]
   }
}
```
> Transaction type is [Collectable](../how_does_it_work.md#collectable-type).

With [paging](../query_options.md#paging), [watch](../query_options.md#watch) and [direct respond options](../query_options.md#respondDirect):

```TypeScript
const result = await service.getCollectables(['xxxxx'], { limit: 1, watch: Watch.ADD, respondDirect: true })

console.log(result)
```

Result:

```TypeScript
{
  total: 1,
  limit: 1,
  skip: 0,
  data: [
    {
      amount: 100000,
      collect: {},
      createdAt: '2020-06-07T08:02:34.771Z',
      expires: [Object],
      from: 'D0',
      id: 'aaaaa',
      salt: 'bbbbb',
      state: 'ready',
      to: 'xxxxx',
      updatedAt: '2020-06-07T08:02:34.771Z'
    }
  ]
}
```

[⬑ _to top_](#contents)

[◅ _return home_](../README.md)
