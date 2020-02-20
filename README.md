# Kirobo Retrievable Transfer Library

## Contents

- [What this library is intended to do?](#What-this-library-is-intended-to-do?)
- [How does it work?](#How-does-it-work?)
- [API](#API)
- [Dependencies](#Dependencies)
- [Points to mention](#Points-to-mention)

## What this library is intended to do?

This library is an interface for a convenient two-way work with [Retrievable Transfer Service by Kirobo](https://kirobo.io/retrievable-transfer/). A set of [endpoints](api/endpoints.md#API-Endpoints) provides access to full spectrum of Kirobo API services. It will be updated following the further API development.

The library is built with both front-end and back-end in mind. Use of TypeScript allows to provide a convenient and stable work.

[⬑ _to top_](#Kirobo-Retrievable-Transfer-Library)

## How does it work?

Step by step explanation of the process, life-cycle of the transaction on server and more details are discussed [here](api/how_does_it_work.md#How-does-it-work?).

[⬑ _to top_](#Kirobo-Retrievable-Transfer-Library)

## API

[Library's API documentation](api/README.md#API-Documentation).

[⬑ _to top_](#Kirobo-Retrievable-Transfer-Library)

## Dependencies

Current version (v1) is using the following dependencies:

- `@feathersjs/feathers` v4.5.1
- `@feathersjs/socketio-client` v4.5.1
- `socket.io-client` v2.3.0
- `multicoin-address-validator` v0.4.1

These libraries are needed to set up the socket communication with the server and for address validation.

[⬑ _to top_](#Kirobo-Retrievable-Transfer-Library)

## Points to mention

Despite library is built to work with Kirobo API, when used on the back-end library will be occasionally checking the ability to resolve google.com, to ensure, that the connection with API is still on. In case of failure, the library will disconnect the service and reconnect when the Internet connection is back. This is done to ensure, that in case of connection restore the database can automatically refresh the status (block height, server status and latest average fee), as well as [to obtain the status of the last Collectables requested](api/endpoints.md#Caching-of-get-Collectables-request).

[⬑ _to top_](#Kirobo-Retrievable-Transfer-Library)