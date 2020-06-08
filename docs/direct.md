# Direct work with Kirobo API
[◅ _return home_](../README.md)

## Contents

- [Endpoints](#endpoints)
- [Direct HTTP use](#direct-http-use)
  - [Login](#login)
  - [Networks](#networks)
  - [UTXOs](#utxos)

## Endpoints

To connect to Kirobo API server directly you will need FeathersJS ([client setup](https://docs.feathersjs.com/api/client.html), [authentication](https://docs.feathersjs.com/api/authentication/) and [querying](https://docs.feathersjs.com/api/databases/querying.html)) and the endpoints below:

- ```v1/btc/networks``` to obtain [networks status](examples/examples.md#update-status).
- ```v1/btc/testnet/action/collect``` for [collecting transaction](examples/collect.md).
- ```v1/btc/testnet/action/retrieve``` for [retrieving transaction from deposit](examples/retrieve.md).
- ```v1/btc/testnet/collectables``` to [get list of collectable transactions](examples/examples.md#get-collectable-transactions).
- ```v1/btc/testnet/transfers``` to [get list of (retrievable) transactions](examples/examples.md#get-retrievable-transfers-by-owner-id).
- ```v1/btc/testnet/utxos``` to [get list of UTXOs](examples/utxos.md#get-utxos).
- ```v1/btc/testnet/exists``` to check for existing UTXOs (to get [fresh](examples/utxos.md#get-fresh-utxos) or [used](examples/utxos.md#get-used-utxos) addresses).

> ☝To work in other network, change ```testnet``` to the required one.

[⬑ _to top_](#direct-work-with-kirobo-api)

## Direct HTTP use

You can use Kirobo API via HTTP (REST).

### Login

In order to use Kirobo API via HTTP, you need first obtain JSON token, via endpoint ```/authentication```:

```bash
curl https://api.kirobo.me/authentication -H 'Content-Type: application/json' -d '{"key": <Your-Key>, "secret”:<Your-Secret>, "strategy": "local”} | jq
```

As response you will get:

```bash
{
  "accessToken": "aaaaa",
  "authentication": {
    "strategy": "local"
  },
  "user": {
    "_id": "bbbbb",
    "key": "ccccc",
    "name": "User",
    "active": true
  }
}
```

You can use the __accessToken__ in further requests.

[⬑ _to top_](#direct-work-with-kirobo-api)

### Networks

Now you can get networks status, using ```v1/btc/networks``` endpoint:

```bash
curl https://api.kirobo.me/v1/btc/networks -H 'Authorization: <Your-Access-Token>' | jq
```
Response:
```bash
{
  "total": 2,
  "limit": 100,
  "skip": 0,
  "data": [
    {
      "height": 1764069,
      "online": true,
      "netId": "testnet",
      "timestamp": 1591621011,
      "fee": 1083,
      "updatedAt": "2020-06-08T12:56:53.944Z"
    },
    {
      "height": 633713,
      "online": true,
      "netId": "main",
      "timestamp": 1591621485,
      "fee": 80393,
      "updatedAt": "2020-06-08T13:05:12.164Z"
    }
  ]
}
```

### UTXOs

To get UTXOs for address:

```bash
curl 'https://api.kirobo.me/v1/btc/testnet/utxos/?address=address1;address2' -H 'Authorization: <Your-Access-Token>' | jq
```

Result:

```bash
{
  "total": 2,
  "skip": 0,
  "limit": 100,
  "data": [
    {
      "address": "aaaaa",
      "height": 1746524,
      "hex": "bbbbb",
      "type": "SCRIPTHASH",
      "txid": "ccccc",
      "value": 200000,
      "vout": 0
    },
    {
      "address": "ddddd",
      "height": 1746692,
      "hex": "eeeee",
      "type": "SCRIPTHASH",
      "txid": "fffff",
      "value": 200000,
      "vout": 0
    },
  ]
}
```

[⬑ _to top_](#direct-work-with-kirobo-api)

### exists

```bash

```