# Collecting transaction

[◅ _return to Examples_](examples.md#contents)

Collecting a transaction is very simple - just provide the transaction ID and a key, encrypted with [@kiroboio/safe-transfer-crypto](https://www.npmjs.com/package/@kiroboio/safe-transfer-crypto) and salt from Collectable transaction you want to collect:

```TypeScript
interface CollectRequest {
  id: string // transaction ID to collect
  key: string // encrypted key from passcode
}
```

thus, the full code will be:

```TypeScript
// library to load environment variables from .env file
import dotenv from 'dotenv'
// import method from Kirobo encryption library
import { generateDecryptionKey } from '@kiroboio/safe-transfer-crypto'

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

  function makeCollectableObject(transaction: Collectable, passcode: string) {
    return {
      id: transaction.id,
      key: generateDecryptionKey({
        passcode,
        salt: transaction.salt,
      }),
    }
  }

  try {
    // make collectable object and send it
    service.collect(makeCollectableObject(transaction, passcode))
  } catch (err) {
    console.log(err)
  }
}

// run the main function
run()
```
Event bus (or directly, if requested) will get the following event:

```TypeScript
{ type: "service_collect_transaction",
  payload: {
    fromNodeTxid: "7ced7833c159d65a093298d4aec8025a4bbe33f84f327cd0e3531d82774a1b93"
  }
}
```
If you have used [watch](query_options.md#watch) options on this collect or on previous [getCollectables()](examples.md#get-collectable-transactions) / [getRetrievables()](examples.md#get-retrievable-transfers-by-owner-id) requests, you will start getting updates about this transaction. First will be:

```TypeScript
{
  type: "service_updated_collectable"
  payload: {
    amount: 100000
    collect: {
      broadcasted: 1111111,
      confirmed: -1,
      txid: "aaaaa"
    }
    createdAt: "2020-06-07T08:02:34.771Z"
    expires: {
      block: 1111222
    },
    from: "Kirobo"
    id: "bbbbb"
    salt: "ccccc"
    state: "collecting"
    to: "xxxxx"
    updatedAt: "2020-06-07T13:15:19.606Z"
  }
}
```
Updates will be coming on on each state change __ready__ > __collecting__ > __collected__. Using changes of the block height from [getStatus()](examples.md#update-status) vs ```transaction.collect.confirmed```, it is easy to calculate quantity of confirmations:

![alt](https://github.com/kiroboio/ki-safe-transfer-lib/raw/develop/docs/examples/screenshots/collected.jpg)

[⬑ _to top_](#collecting-transaction)

[◅ _return to Examples_](examples.md)