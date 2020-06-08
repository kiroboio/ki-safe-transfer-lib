# Sending transaction
[◅ _return to Examples_](examples.md#contents)

To send a transaction, first the SendRequest has to be formed:

```TypeScript
interface SendRequest {
  amount: number // the transfer amount in satoshi
  collect: string // encrypted raw collect transaction
  deposit?: string // raw deposit transaction
  depositPath?: string // deposit hd derived path
  from?: string // free text to be attached to this transfer
  hint?: string // passcode hint for the recipient
  owner: string // owner ID for this transaction, maxLength: 120, minLength: 20
  salt: string // salt use to encrypt collect transaction and passcode when collecting it
  to: string // the destination address
}
```
Like this:
```TypeScript
 // library to load environment variables from .env file
import dotenv from 'dotenv'
// import method from Kirobo encryption library
import { encryptTransaction } from '@kiroboio/safe-transfer-crypto';

// import required class, types and tool
import Service, { Responses, Event, DebugLevels, wait, SendRequest, Watch } from '@kiroboio/safe-transfer-lib'

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

  const transaction: SendRequest = {
    amount: 111111111,
    collect: encryptTransaction({
      raw: 'bbbbb',
      passcode: 'ccccc',
      salt: 'ddddd',
    }),
    deposit: 'eeeee',
    depositPath: 'fffff',
    from: 'Kirobo',
    owner: 'ggggg',
    salt: 'ddddd',
    to: 'aaaaa',
  }

    try {
    // send transaction and add subscribe to 'watching' updates of this transaction
    service.send(transaction, { watch: Watch.ADD })
  } catch (err) {
    console.log(err)
  }
}

// run the main function
run()
```

Once transaction is accepted, the event will be sent (or library will respond directly):

```TypeScript
{
  amount: 100000,
  collect: {},
  createdAt: '2020-06-07T14:30:11.541Z',
  deposit: { // information about the deposit made
    txid: 'aaaaa',
    vout: 0,
    value: 101167,
    address: 'bbbbb',
    path: "ccccc",
  },
  expires: {
    at: '2020-06-08T02:30:11.541Z',
  },
  from: 'Kirobo',
  id: 'dddddd',
  retrieve: {
    broadcasted: -1,
    confirmed: -1,
    txid: '',
  },
  state: 'new',
  to: 'eeeee',
  updatedAt: '2020-06-07T14:30:11.541Z',
  owner: 'fffff', // owner ID, which will allow to find this and other transactions on server
}
```
[⬑ _to top_](#sending-transaction)