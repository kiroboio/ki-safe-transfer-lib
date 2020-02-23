# Errors and handling them
[◅ _return home_](api.md#api-documentation)

## Contents

- [Why throwing errors?](#why-throwing-errors)
- [What types of error?](#what-types-of-error)
- [How to handle them?](#how-to-handle-them)


## Why throwing errors?

Throwing errors allow to provide feedback multiple occasion, when either something doesn't go the right way, or when we get a certain feedback from server. Messages in errors include as much meaningful information as possible. That is highly advisable to ensure that  service calls are covered with [error handling](#how-to-handle-them?).

 [⬑ _to top_](#errors-and-handling-them)

## What types of error?

There are two types of errors - _TypeError_ and _Error_. While _TypeError_ is used mainly when checking the arguments in functions, the regular _Error_ is used in all other cases.

[⬑ _to top_](#errors-and-handling-them)

## How to handle them?

This documentation is using one of the ways JavaScript/TypeScript allows to handle the errors, however you can use any.

For example, library comes with default settings, and there is no need to provide any to start working (please, read more about [default settings](setup.md#default-settings) before using library):

```TypeScript
async function run() {
  try {
    const service = new Service()
    const result = await service.getStatus()
    console.log(result) // { height: 1666099, online: true, fee: 1000 }
  } catch (e) {
    console.log(e.message)
  }
}

run()
```

However, in case you try to provide empty object:

```TypeScript
async function run() {
  try {
    const service = new Service({})

    const result = await service.getStatus()
    console.log(result)
  } catch (e) {
    console.log('error: ', e.message) // error:  Settings object can't be empty.
  }
}

run()
```

or empty array:

```TypeScript
async function run() {
  try {
    const service = new Service([])

    const result = await service.getStatus()
    console.log(result)
  } catch (e) {
    console.log('error: ', e.message) // error:  Argument can't be an Array.
  }
}
run()
```

[⬑ _to top_](#errors-and-handling-them)

[◅ _return home_](api.md#api-documentation)