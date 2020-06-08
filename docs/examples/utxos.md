# Working with UTXOs
[◅ _return to examples_](examples.md#contents)

## Contents

- [Get UTXOs](#get-utxos)
  - [Data type](#data-type)
- [Get fresh UTXOs](#get-fresh-utxos)
- [Get used UTXOs](#get-used-utxos)

Kirobo API offers services to [get UTXOs](../find_utxos.md#how-to-use-the-library), [find fresh](../find_addresses.md#how-to-use-the-library) and [used](../find_addresses.md#how-to-use-the-library) addresses

## Get UTXOs

Kirobo API offers service to find unspent transaction outputs for addresses, as simple as:

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
  // get all UTXOs for address
  service.getUtxos(['xxxxx','yyyyy'])
  } catch (err) {
    console.log(err)
  }
}

// run the main function
run()
```
> ☝Request supports [query options](../query_options.md), except watch.

Service will respond with [Results](response.md#results-object-with-data) object:

```TypeScript
{ type: 'service_get_utxos',
  payload:
   { total: 8,
     skip: 0,
     limit: 100,
     data:
      [ { address: 'xxxxx',
          height: 1746521,
          hex: 'aaaaa',
          type: 'SCRIPTHASH',
          txid: 'bbbbb',
          value: 100000,
          vout: 0 },
        { address: 'yyyyy',
          height: 1746668,
          hex: 'ccccc',
          type: 'SCRIPTHASH',
          txid: 'ddddd',
          value: 100000,
          vout: 0 },
      ]
   }
}
```
[⬑ _to top_](#contents)

### Data type

Data in results is an array of Utxo objects:

```TypeScript
interface Utxo {
  address: string
  height: number
  hex: string
  type: 'SCRIPTHASH'
  txid: string
  value: number
  vout: number
}
```
[⬑ _to top_](#contents)

## Get fresh UTXOs

You can easily filter the addresses to get those with fresh UTXOs:

```TypeScript
service.getFresh(['xxxxx','yyyyy'])
```

The response will be:

```TypeScript
{ type: 'service_get_used',
  payload:
   { total: 0, skip: 0, limit: 100, data: []
   }
}
```

[⬑ _to top_](#contents)
## Get usd UTXOs
You can easily also filter the addresses to get only those with used UTXOs:

```TypeScript
service.getUsed(['xxxxx','yyyyy'])
```

With response:

```TypeScript
{ type: 'service_get_used',
  payload:
   { total: 1, skip: 0, limit: 100, data: [ 'xxxxx' ]
   }
}
```

[⬑ _to top_](#contents)