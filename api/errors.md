## Errors and handling them
[◅ _return home_](../README.md#Kirobo-Retrievable-Transfer-Library)

- [Why throwing errors?](#Why-throwing-errors?)
- [What types of error?](#What-types-of-error?)
- [How to handle them?](#How-to-handle-them?)


#### Why throwing errors?

Throwing errors allow to provide feedback multiple occasion, when either something doesn't go the right way, or when we get a certain feedback from server. Messages in errors include as much meaningful information as possible. That is highly advisable to ensure that  service calls are covered with [error handling](#How-to-handle-them?).

#### What types of error?

There are two types of errors - _TypeError_ and _Error_. While _TypeError_ is used mainly when checking the arguments in functions, the regular _Error_ is used in all other cases.

#### How to handle them?

This documentation is using one of the ways JavaScript/TypeScript allows to handle the errors, however you can use any.

For example, library comes with default settings, and there is no need to provide any to start working (please, read more about [default settings](setup.md#Default-settings) before using library):

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

[◅ _return home_](../README.md#Kirobo-Retrievable-Transfer-Library)