# Example Code

## Contents

- [Update status](#update-status)
  - [Direct response](#direct-response)
- [Get exchange rates](#get-exchange-rates)
  - [Single source](#single-source)
- [React app with Redux](react.md#react-app-with-redux)


## Update status

Request block height, online status, network ID, average fee of the last block. Authentication request key/secret pair, which can be obtain either through ```.env``` file (we are going to use this way further on):

```TypeScript
// library to load environment variables from .env file
import dotenv from 'dotenv'

 // import required class, types and tool
import Service, { Responses, Event, DebugLevels, wait, Watch } from '../src'

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

  // request status update and add it to 'watch' list, to receive further updates via eventBus
  service.getStatus({ watch: Watch.ADD })
}

// run the main function
run()
```

or importing from config file:

```TypeScript

import Service, { Responses, Event, DebugLevels, wait, Watch } from '../src'

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

  // request status update and add it to 'watch' list, to receive further updates via eventBus
  service.getStatus({ watch: Watch.ADD })
}

// run the main function
run()

```

On the initial connection (when we __replace__ instance), library will automatically request status update, but it will not add it to watch list. It is done in this way so you can decide whether you want to 'watch' it or not. Without __eventBus__ callback function provided no real-time updates can be provided, such as transaction state updates, collection/retrieving information update and others.

 [⬑ _to top_](#contents)

#### Direct response

The data can be requested with direct response:

```TypeScript
// library to load environment variables from .env file
import dotenv from 'dotenv'

 // import required class, types and tool
import Service, { Responses, Event, DebugLevels, wait } from '../src'

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

}

// run the main function
run()
```
[⬑ _to top_](#contents)

### Get exchange rates

You can request exchange rates for BTC (currently to USD onyl) from 3 sources or any one of them:

```TypeScript
// library to load environment variables from .env file
import dotenv from 'dotenv'

// import required class, types and tool
import Service, { Responses, Event, DebugLevels, wait } from '../src'

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

  // request exchange rates from all available sources
  service.getRates()
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

You can utilize paging options to narrow down the results:

```TypeScript
service.getRates({ limit: 2, skip: 1 })
```
or add it to a 'watch' list to get updates:
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
import Service, { Responses, Event, DebugLevels, wait, Watch, RatesSources } from '../src'

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

  // request exchange rates from preferred source
  service.getRate({ source: RatesSources.COINGECKO, options: { watch: Watch.ADD } })
}

// run the main function
run()
```
You will be getting the following event:

```TypeScript
{ type: 'service_get_btc_to_usd_rate',
  payload:
   { source: 'coingecko.com', timestamp: 1591266540, online: true, value: 9533.772 } }
```

> If your preferred source is BitFinex, then you don't have to specify it, as It's a default one:

```TypeScript
service.getRate({ options: { watch: Watch.ADD } })
```

[⬑ _to top_](#contents)

