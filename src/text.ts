const ERRORS = {
  connect: {
    authenticate: 'Service (authSocket > authenticate) caught error when calling (getStatus).',
    reAuthenticate: 'Service (authSocket > reAuthenticate) caught error.',
    authSocket: 'Service (authSocket) caught error.',
    on: {
      connect: {
        direct: 'Service (onConnect) caught error.',
        authSocket: 'Service (authSocket on connect) caught error.',
      },
      disconnect: {
        direct: 'Service (onDisConnect) caught error.',
      },
    },
  },
  validation: {
    extraKey: 'Extra key (%1) found in %2 argument of [%3] function.',
    missingArgument: 'Required argument %1 in %2 argument of [%3] function is missing.',
    missingKey: 'Required key %1 in %2 argument of [%3] function is missing.',
    wrongTypeArgument: 'Type of argument %1 in function [%2] is wrong - %3. Should be %4.',
    wrongTypeKey: 'Type of key %1 in function [%2] is wrong - %3. Should be %4.'
  }
}

const WARNINGS = {
  connect: {
    disconnect: 'Service is disconnected.',
  },
}

export { ERRORS, WARNINGS }
