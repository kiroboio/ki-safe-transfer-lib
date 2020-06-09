# Query Options

[◅ _return home_](README.md#kirobo-retrievable-transfer-library-documentation)

## Contents

- [Options](#options)
- [Paging](#paging)
- [Actions](#actions)
  - [respondDirect](#respondDirect)
  - [watch](#watch)

## Options

Query options are optional parameters for methods of the library. Their availability varies due to logic of the implementation.

The options are:

- limit
- skip
- respondDirect
- watch

First two belong to paging group of options. The latter two - actions group.

[⬑ _to top_](#query-options)

## Paging

```limit``` and ```skip``` allow you to regulate the quantity of the results (```limit```) and split it into pages or batches (```skip```) of results.

For example, simple [getRates()]() request:

```TypeScript
...

service.getRates()
```

Gets us the following event:

```TypeScript
{ type: 'service_get_btc_to_usd_rates',
  payload:
   { total: 3,
     limit: 100,
     skip: 0,
     data:
      [ { source: 'coingecko.com', timestamp: 1591695890, online: true, value: 9659.848 },
        { source: 'blockchain.info', timestamp: 1591695890, online: true, value: 9660.34 },
        { source: 'bitfinex.com', timestamp: 1591695890, online: true, value: 9656.931402 }
      ]
   }
}
```
We have three results here. We cane limit them to 1:

```TypeScript
...

service.getRates({ limit: 1 })
```
Result:
```TypeScript
{ type: 'service_get_btc_to_usd_rates',
  payload:
   { total: 3,
     limit: 1,
     skip: 0,
     data:
      [ { source: 'coingecko.com', timestamp: 1591696040, online: true, value: 9660.575 }
      ]
   }
}
```

or limit to 2, but 2 last ones:

```TypeScript
service.getRates({ limit: 2, skip: 1 })
```

Result:

```TypeScript
{ type: 'service_get_btc_to_usd_rates',
  payload:
   { total: 3,
     limit: 2,
     skip: 1,
     data:
      [ { source: 'blockchain.info', timestamp: 1591696130, online: true, value: 9666.58 },
        { source: 'bitfinex.com', timestamp: 1591696130, online: true, value: 9664.76308931 }
      ]
    }
}
```
> ☝ Examples above are for quick explanation. There much easier ways to work with rates - [example](examples/examples.md#single-source) and [another one](direct.md#rates).

This is applicable to every method returning [Results<any>](results.md).

[⬑ _to top_](#query-options)

## Actions

Actions on the other hand, allow you to channel the response directly, not through eventBus callback (if it has been set globally) and to watch (subscribe to) change of the event, regarding status (block height mainly) and transaction states.

### respondDirect

If the [Callback](setup.md#respondas) is set as default response method and eventBus callback function is provided, you can still bypass the setting to receive a direct response to your request. For example, we setup service to respond via callback:

```TypeScript
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
```
and now our request:

```TypeScript
...

service.getStatus()
```
will respond via eventBus:

```TypeScript
{ type: 'service_update_status',
  payload:
   { height: 1764134,
     online: true,
     netId: 'testnet',
     timestamp: 1591696696,
     fees: [ 999, 999, 999, 999, 999, 999, 999, 999, 999, 999 ],
     fee: 1091,
     updatedAt: '2020-06-09T09:58:18.867Z' }
   }
}
```

If we want to get current block height and assign it to variable to work with it later (to count the quantity of confirmations, for example), we can do the following:

```TypeScript
try {
    const response = await service.getStatus({ respondDirect: true }) as Status // Status is a type, exported from the library

    console.log(response.height)
  } catch (err) {
    console.log(err)
  }
}
```

> A full example of request with direct response can be found [here](examples/examples.md#direct-response).

[⬑ _to top_](#query-options)

### watch

Watch option allows us to watch for changes (subscribe to) in status events and/or transactions.

Let continue with status. Let's say we want to receive status updates whenever the happen:

```TypeScript
service.getStatus({ watch: Watch.ADD }) // Watch enum is exported from the library
```

You will get the standard status update event, but form now one you will also receive the updates.

```Watch``` option has several values:

```TypeScript
enum Watch {
  DISABLE = 'disable', // to cancel all subscriptions - this is the default behavior when watch param does not exist
  ADD = 'add', // to add this query to the existing subscriptions (or create a new subscription for the current query when there is none)
  REPLACE = 'replace', // to remove old subscriptions and create a new subscription for the current query
  IGNORE = 'ignore', // the current query won’t affect the existing subscription
}
```

[⬑ _to top_](#query-options)
[◅ _return home_](README.md#kirobo-retrievable-transfer-library-documentation)
