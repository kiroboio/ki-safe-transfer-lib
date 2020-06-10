![Kirobo](https://kirobo.io/wp-content/uploads/2020/01/cropped-logo.png)

# Kirobo Transfer Library Documentation
[◅ _return home_](../README.md#Kirobo-Retrievable-Transfer-Library)

## Contents

  - [Contents](#contents)
  - [What this library is intended to do?](#what-this-library-is-intended-to-do)
  - [How does it work?](#how-does-it-work)
  - [Dependencies](#dependencies)
  - [Points to mention](#points-to-mention)
  - [Terminology](#terminology)
  - [Library API & Tools Documentation](documentation.md#documentation)

## What this library is intended to do?

This library is an interface for a convenient two-way work with [Retrievable Transfer Service by Kirobo](https://kirobo.io/index.php/retrievable-transfer/) and a set of blockchain services - [Find UTXOs](find_utxos.md#find-utxos) and [Find Free and Used Addresses](find_addresses.md#find-free-and-used-addresses). A set of [endpoints](endpoints.md#api-endpoints) provides access to full spectrum of Kirobo API services. It is kept up to date with current API development.

The library is built with both front-end and back-end in mind. Use of TypeScript allows to provide a convenient and stable work.

[⬑ _to top_](#kirobo-retrievable-transfer-library-documentation)

## How does it work?

Step by step explanation of the process, life-cycle of the transaction on server and more details are discussed [here](how_does_it_work.md#how-does-it-work).

[⬑ _to top_](#kirobo-retrievable-transfer-library-documentation)

## Dependencies

Current version (v2) uses the following dependencies:

- `@feathersjs/feathers` v4.5.3
- `@feathersjs/socketio-client` v4.5.4
- `@feathersjs/authentication-client` v4.5.4
- `socket.io-client` v2.3.0
- `multicoin-address-validator` v0.4.4
- `ramda` v0.27.0
- `uuid` v8.1.0

These libraries are needed to set up the socket communication with the server, for address validation and are used in functions. Some of the functionality of these libraries are exposed through the library API.

[⬑ _to top_](#kirobo-transfer-library-documentation)

## Points to mention

Despite library is built to work with Kirobo API, when used on the back-end library will be occasionally checking the ability to resolve google.com, to ensure, that the connection with API is still on. In case of failure, the library will disconnect the service and reconnect when the Internet connection is back. This is done to ensure, that in case of connection restore the database can automatically refresh the status (block height, server status and latest average fee), as well as [to obtain the status of the last Collectables requested](api.md#caching-of-get-collectables-request).

[⬑ _to top_](#kirobo-transfer-library-documentation)

## Terminology

What is Retrievable? What is Collectable? We are going to use these many times.

Retrievable is a transaction object which contains all the data for deposit and collect. It also contains enough data to retrieve it. Some data is encrypted to ensure the security of the transactions, other data is open and available from the blockchain. Collectable is brief version of Retrievable, so it would be safe to display it to the recipient. Without passcode, recipient will not know anything besides specific data sender would like him to know. More on the structure, as well as to read about life cycle of the above you can find [here](how_does_it_work.md#life-on-server).

[⬑ _to top_](#kirobo-transfer-library-documentation)

[◅ _return home_](../README.md#Kirobo-Retrievable-Transfer-Library)


