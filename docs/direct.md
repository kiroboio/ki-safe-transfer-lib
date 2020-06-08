# Direct work with Kirobo API
[◅ _return home_](../README.md)

## Contents

- [Endpoints](#endpoints)
- [Direct HTTP use](#direct-http-use)
  - [Methods](#methods)
  - [Login](#login)
  - [Networks](#networks)
  - [UTXOs](#utxos)
  - [Exists](#exists)
  - [Rates](#rates)
  - [Get collectable transfers](#get-collectable-transfers)
  - [Get all transfers](#get-all-transfers)
  - [Send](#send)
  - [Collect](#collect)
  - [Retrieve](#retrieve)

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

### Methods

The methods for endpoints are:

- Networks = ```GET```
- Utxos = ```GET```
- Exists = ```GET```
- Rates = ```GET```
- Collectables = ```GET```
- Transfers  = ```GET```, ```POST``` (to send)
- Collect = ```POST``` (to collect)
- Retrieve = ```POST``` (to retrieve)

### Login

In order to use Kirobo API via HTTP, you need first obtain JSON token, via endpoint ```/authentication```:

```bash
curl https://api.kirobo.me/authentication -H 'Content-Type: application/json' -d '{"key": <Your-Key>, "secret”:<Your-Secret>, "strategy": "local”}
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
curl https://api.kirobo.me/v1/btc/networks -H 'Authorization: <Your-Access-Token>'
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
curl 'https://api.kirobo.me/v1/btc/testnet/utxos/?address=address1;address2' -H 'Authorization: <Your-Access-Token>'
```

Result:

```bash
{
  "total": 2,
  "skip": 0,
  "limit": 100,
  "data": [
    {
      "address": "address1",
      "height": 1746524,
      "hex": "a914023992f7ce9aa99ad2cb7dc8ba2e16d95217b16b87",
      "type": "SCRIPTHASH",
      "txid": "5d26df3a0a4c6142d7ccf1d020ea08fedba578f3a7dce826a7de786213adc36a",
      "value": 200000,
      "vout": 0
    },
    {
      "address": "address1",
      "height": 1746692,
      "hex": "a91403e0269195c1fda0ca2b1bf43c1924fef2ce56f387",
      "type": "SCRIPTHASH",
      "txid": "5c1b700a5000c3108e04327fe3c5a1e22c8571a49b9e00e1a26619ac76a4fd26",
      "value": 200000,
      "vout": 0
    },
  ]
}
```

[⬑ _to top_](#direct-work-with-kirobo-api)

### Exists

You can use library to send an array of addresses to check if addresses exist:

```bash
curl 'https://api.kirobo.me/v1/btc/testnet/exists/?address=address1;address2;address3' -H 'Authorization: <Your-Access-Token>'
```

Result:

```bash
{
  "total": 2,
  "skip": 0,
  "limit": 100,
  "data": [
    {
      "address": "address2"
    },
    {
      "address": "address3"
    }
  ]
}
```
[⬑ _to top_](#direct-work-with-kirobo-api)

### Rates

You can request exchange rates for BTC (currently to USD only) from 3 sources or any one of them:

```bash
curl 'https://api.kirobo.me/v1/btc/to/usd' -H 'Authorization: <Your-Access-Token>'
```

or choose sources:

```bash
curl 'https://api.kirobo.me/v1/btc/to/usd/?source=bitfinex.com;blockchain.info' -H 'Authorization: <Your-Access-Token>'
```

Response in this case will be only:

```bash
{
  "total": 2,
  "limit": 100,
  "skip": 0,
  "data": [
    {
      "source": "blockchain.info",
      "timestamp": 1591625640,
      "online": true,
      "value": 9677.82
    },
    {
      "source": "bitfinex.com",
      "timestamp": 1591625640,
      "online": true,
      "value": 9672
    }
  ]
}
```

[⬑ _to top_](#direct-work-with-kirobo-api)

### Get collectable transfers

To get all collectables transactions for an address or addresses, simply send a request:

```bash
curl 'https://api.kirobo.me/v1/btc/testnet/collectables?to=address' -H 'Authorization: <Your-Access-Token>'
```
Result:

```bash
{
  "total": 2,
  "limit": 100,
  "skip": 0,
  "data": [
    {
      "amount": 3000000,
      "collect": {},
      "createdAt": "2020-06-08T15:28:50.121Z",
      "expires": {
        "at": "2020-06-09T03:28:49.973Z"
      },
      "from": "From Me",
      "id": "f1774c1a85a75383bxcl907d3s7e33515kmkb",
      "salt": "f1774c1a85a75383bxcl907d3s7e33515b876c2bd38950ad4e7199437d9d6a29f8caf023",
      "state": "ready",
      "to": "2MsbiY7vpLMJa7nJpf5tP3qzrEUBdYfX9Yi",
      "updatedAt": "2020-06-08T15:28:50.121Z"
    },
    {
      "amount": 4000000,
      "collect": {},
      "createdAt": "2020-06-08T15:41:52.808Z",
      "expires": {
        "at": "2020-06-09T03:41:52.684Z"
      },
      "from": "Invoice 2323242",
      "id": "f1774c1a85a75383bxcl907d3s7e33515b0980",
      "salt": "00f214f5ef532a281e49808fdbve8dcc7044cbe71e13a56cff4b7d8f9068c5d2c1c",
      "state": "ready",
      "to": "2MsbiY7vpLMJa7nJpf5tP3qzrEUBdYfX9Yi",
      "updatedAt": "2020-06-08T15:41:52.808Z"
    }
  ]
}
```
[⬑ _to top_](#direct-work-with-kirobo-api)

### Get all transfers

Get all transactions sent with a certain owner ID:

```bash
curl 'https://api.kirobo.me/v1/btc/testnet/transfers?owner=owner_id' -H 'Authorization: <Your-Access-Token>'
```

Result:

```bash
{
  "total": 4,
  "limit": 100,
  "skip": 0,
  "data": [
    {
      "amount": 142857,
      "collect": {},
      "createdAt": "2020-06-08T09:13:01.580Z",
      "deposit": {
        "txid": "d3e344b8c5d1ab2ca458d8b20ad7f948b4776681c55b89c655e484d22b7adfd6",
        "vout": 0,
        "value": 143166,
        "address": "2Muo8DiG9zkNgEvSrbWoyR4jHqEZKp5EGU2",
        "path": "49'/1'/0'/0/0"
      },
      "expires": {
        "at": "2020-06-08T21:13:01.580Z"
      },
      "from": "",
      "id": "f1774c123ka85a75380k3bxcl907d3s7e33515b",
      "retrieve": {
        "broadcasted": -1,
        "confirmed": -1,
        "txid": ""
      },
      "state": "ready",
      "to": "tb1q558cx45amcfvnemmxry4qt7q9ppm8zrtwr3wxh",
      "updatedAt": "2020-06-08T09:13:01.663Z",
      "owner": "a487m587ab4ec8268ff61453a5c69872497221288785f02aa83094kmsp20a14b2fe132afceb7e2d3e501a63b046cb985372aa3e024f6a13"
    },
     {
      "amount": 285714,
      "collect": {},
      "createdAt": "2020-06-08T12:43:22.835Z",
      "deposit": {
        "txid": "f5f5eef74b7386f41fa5f1f7f2b63c76c8186e6668c8800313fa95a1648c0581",
        "vout": 0,
        "value": 285941,
        "address": "2N9ghusqPD4Vs8LMvxFyEh16BvPnsvwoKj2",
        "path": "49'/1'/0'/0/0"
      },
      "expires": {
        "at": "2020-06-09T00:43:22.835Z"
      },
      "from": "",
      "id": "fa774c18ka85a75383bxcl907d3s7ekj33515b",
      "retrieve": {
        "broadcasted": -1,
        "confirmed": -1,
        "txid": ""
      },
      "state": "ready",
      "to": "tb1q558cx45amcfvnemmxry4qt7q9ppm8zrtwr3wxh",
      "updatedAt": "2020-06-08T12:43:22.911Z",
      "owner": "a487m587ab4ec8268ff61453a5c69872497221288785f02aa85af60a14b2fe132afceb7e2d3e501a63b046cb985372aa3e024f6a13"
    },
  ]
}
```

[⬑ _to top_](#direct-work-with-kirobo-api)

### Send

To send a transaction, first the [SendRequest](examples/send.md) has to be sent as following:

```bash
curl -XPOST 'https://api.kirobo.me/v1/btc/testnet/transfers' -H 'Content-Type: application/json' --data '{"amount": 2343, "to":"address1", "collect":"collect_trx", "owner":"owner_id","salt":"salt"}' -H 'Authorization: <Your-Access-Token>'
```

More about encryption details you can find [here](encryption.md).

Response:

```bash
{
  "amount": 142857,
  "collect": {},
  "createdAt": "2020-06-08T09:13:01.580Z",
  "deposit": {
    "txid": "d3e344b8c5d1ab2ca458d8b20ad7f948b4776681c55b89c655e484d22b7adfd6",
    "vout": 0,
    "value": 143166,
    "address": "2Muo8DiG9zkNgEvSrbWoyR4jHqEZKp5EGU2",
    "path": "49'/1'/0'/0/0"
  },
  "expires": {
    "at": "2020-06-08T21:13:01.580Z"
  },
  "from": "",
  "id": "f1774c123ka85a75380k3bxcl907d3s7e33515b",
  "retrieve": {
    "broadcasted": -1,
    "confirmed": -1,
    "txid": ""
  },
  "state": "ready",
  "to": "tb1q558cx45amcfvnemmxry4qt7q9ppm8zrtwr3wxh",
  "updatedAt": "2020-06-08T09:13:01.663Z",
  "owner": "a487m587ab4ec8268ff61453a5c69872497221288785f02aa83094kmsp20a14b2fe132afceb7e2d3e501a63b046cb985372aa3e024f6a13"
}
```

[⬑ _to top_](#direct-work-with-kirobo-api)

### Collect

Collecting a transaction is very simple - just provide the transaction ID and a key, encrypted with [@kiroboio/safe-transfer-crypto](https://www.npmjs.com/package/@kiroboio/safe-transfer-crypto) and salt from Collectable transaction you want to collect:

```bash
curl -XPOST 'https://api.kirobo.me/v1/btc/testnet/action/collect' -H 'Content-Type: application/json' --data '{"id": "my-collectable-id", "key":"my-secret-key" }' -H 'Authorization: <Your-Access-Token>'
```
In response you will receive transaction ID.

[⬑ _to top_](#direct-work-with-kirobo-api)

### Retrieve

To retrieve available transaction, you need to ensure that it's state is __ready__. Then send retrieve request:

```bash
curl -XPOST 'https://api.kirobo.me/v1/btc/testnet/action/retrieve' -H 'Content-Type: application/json' --data '{"id": "my-collectable-id", "raw":"transaction-hex" }' -H 'Authorization: <Your-Access-Token>'
```
In response you will receive transaction ID.

[⬑ _to top_](#direct-work-with-kirobo-api)