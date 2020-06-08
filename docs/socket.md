# Socket Connection
[◅ _return home_](../README.md)

To connect to Kirobo API server directly you will need FeathersJS ([client setup](https://docs.feathersjs.com/api/client.html), [authentication](https://docs.feathersjs.com/api/authentication/) and [querying](https://docs.feathersjs.com/api/databases/querying.html))  and the endpoints below:

  - ```v1/btc/testnet/action/collect``` for [collecting transaction](examples/collect.md).
- ```v1/btc/testnet/action/retrieve``` for [retrieving transaction from deposit](examples/retrieve.md).
- ```v1/btc/testnet/collectables``` to [get list of collectable transactions](examples/examples.md#get-collectable-transactions).
- ```v1/btc/testnet/transfers``` to [get list of (retrievable) transactions](examples/examples.md#get-retrievable-transfers-by-owner-id).
- ```v1/btc/testnet/utxos``` to [get list of UTXOs](examples/utxos.md#get-utxos).
- ```v1/btc/testnet/exists``` to check for existing UTXOs (to get [fresh](examples/utxos.md#get-fresh-utxos) or [used](examples/utxos.md#get-used-utxos) addresses).

> ☝To work in other network, change ```testnet``` to the required one.

[⬑ _to top_](#Socket Connection)