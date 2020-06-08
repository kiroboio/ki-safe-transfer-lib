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
  - [Get (retrievable) transfers](#get-(retrievable)-transfers)
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

```bash
curl 'https://api.kirobo.me/v1/btc/to/usd' -H 'Authorization: <Your-Access-Token>'
```

Choose sources:

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

```bash
curl 'https://api.kirobo.me/v1/btc/testnet/collectables?to=address' -H 'Authorization: <Your-Access-Token>'
```

[⬑ _to top_](#direct-work-with-kirobo-api)

### Get (retrievable) transfers

```bash
curl 'https://api.kirobo.me/v1/btc/testnet/transfers?owner=owner_id' -H 'Authorization: <Your-Access-Token>'
```

[⬑ _to top_](#direct-work-with-kirobo-api)

### Send

```bash
curl -XPOST 'https://api.kirobo.me/v1/btc/testnet/transfers' -H 'Content-Type: application/json' --data '{"amount": 2343, "to":"address1", "collect":"collect_trx", "owner":"owner_id","salt":"salt"}' -H 'Authorization: <Your-Access-Token>'
```

[⬑ _to top_](#direct-work-with-kirobo-api)

### Collect

```bash
curl -XPOST 'https://api.kirobo.me/v1/btc/testnet/action/collect' -H 'Content-Type: application/json' --data '{"id": "my-collecable-id", "key":"my-secret-key" }' -H 'Authorization: <Your-Access-Token>'
```

[⬑ _to top_](#direct-work-with-kirobo-api)

### Retrieve
```bash
curl -XPOST 'https://api.kirobo.me/v1/btc/testnet/action/retrieve' -H 'Content-Type: application/json' --data '{"id": "my-collecable-id", "raw":"transaction-hex" }' -H 'Authorization: <Your-Access-Token>'
```
[⬑ _to top_](#direct-work-with-kirobo-api)