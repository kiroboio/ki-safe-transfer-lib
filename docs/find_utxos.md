# Find UTXOs

[◅ _return to documentation_](documentation.md)

## Contents

- [What this service does?](#what-this-service-does)
- [How to use the library?](#how-to-use-the-library)

---

## What this service does?

You can use library to get UTXOs for the array of addresses provided. Search is done by the Kirobo server, with library providing convenient API and information workflow.

[⬑ _to top_](#find-utxos)

## How to use the library?

The setup for the library is the same as for other uses:

```TypeScript
import Service, { Event } from '@kiroboio/safe-transfer-lib'

const authDetails = {
  key: process.env.AUTH_KEY,
  secret: process.env.AUTH_SECRET
  }

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

Now, with ```service``` we have access to ```getUtxos()``` method, which is used as following:

```TypeScript
service.getUtxos(['xxxx','yyyy','zzzz'])
```

This is a minimal use. Optionally you can override the [default paging settings](query_options.md#paging):

```TypeScript
service.getUtxos(['xxxx','yyyy','zzzz'], { limit: 10, skip: 10 })

// event fired:  {
//   type: 'service_get_utxos',
//   payload: {
//      total: 1,
//      skip: 10,
//      limit: 10,
//      data: [
//      {
//        address: 'xxxx',
//        height: 1721533,
//        hex: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
//        type: 'SCRIPTHASH',
//        txid: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
//        value: 100000,
//        vout: 0
//      },
//      {
//        address: 'zzzz',
//        height: 1721533,
//        hex: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
//        type: 'SCRIPTHASH',
//        txid: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
//        value: 100000,
//        vout: 0
//      }
//      ]
//    }
//  }

```

This will allow you to get 10 results, starting from result #11.

[⬑ _to top_](#find-utxos)

[◅ _return to documentation_](documentation.md)