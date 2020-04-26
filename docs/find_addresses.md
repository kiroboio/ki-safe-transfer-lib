# Find Free and Used Addresses
[◅ _return to documentation_](api.md#api-documentation)

## Contents

- What this service does?
- [How to use the library?](#how-to-use-library)

## How to use library?

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

  const service = new Service({
    respondAs: Responses.Callback,
    eventBus,
    authDetails,
    })

} catch (e) {
  console.log('error: ', e.message)
}
```

Now, with ```service``` we have access to two methods: [getUsed]() and [getFresh](), which are taking array of addresses as parameter as following:

```TypeScript
service.getUsed([ 'used_address_1', 'unused_address', 'used_address_2' ])

// event fired:  {
//   type: 'service_get_used',
//   payload: {
//      total: 1,
//      skip: 1,
//      limit: 1,
//      data: [ 'used_address_1', 'used_address_2' ]
//    }
//  }

service.getFresh([ 'used_address_1', 'unused_address', 'used_address_2' ])

// event fired:  {
//   type: 'service_get_used',
//   payload: {
//      total: 1,
//      skip: 1,
//      limit: 1,
//      data: [ 'unused_address' ]
//    }
//  }
```

These similar methods provide opposite results: [getUsed]() returns only used addresses from your list, while the [getFree]() method returns only free addresses from your list.

Optionally you can override the [default paging settings]():

```TypeScript
service.getUsed([ 'used_address_1', 'unused_address', 'used_address_2' ], { limit: 1, skip: 1 })

// event fired:  {
//   type: 'service_get_used',
//   payload: {
//      total: 1,
//      skip: 1,
//      limit: 1,
//      data: [ 'used_address_2' ]
//    }
//  }

```

This will allow you to get 1 result, starting from result #2.

[⬑ _to top_](#find-free-and-used-addresses)

[◅ _return to documentation_](api.md#api-documentation)