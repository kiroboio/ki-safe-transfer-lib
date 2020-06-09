# Retrieve a transaction from deposit

[◅ _return to examples_](examples.md#contents)

To retrieve available transaction, you need to ensure that it's state is __ready__. Then send retrieve request:

```TypeScript
interface RetrieveRequest {
  id: string // ID of the transaction you want to retrieve
  raw: string // Raw transaction
}
```

The ID can be obtained from [getByOwnerId()](examples.md#get-retrievable-transfers-by-owner-id). Raw transaction will be published to blockchain:

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
    service.retrieve({ id: 'aaaaa', raw: 'bbbbb' })
  } catch (err) {
    console.log(err)
  }
}

// run the main function
run()
```

 In response the library will send:

```TypeScript
fromNodeTxid: 'transaction_id'
```

[⬑ _to top_](#retrieve-transaction-from-deposit)

[◅ _return to examples_](examples.md#contents)
