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
  service: {
    gotError: 'Service (%1) caught [%2] error.',
  },
  validation: {
    emptyArgument: 'Required argument (%1) of [%2] function is empty.',
    missingArguments: 'Required argument (%1) of [%2] function is missing.',
    extraKey: 'Extra key (%1) found in %2 argument of [%3] function.',
    missingArgument: 'Required argument (%1) in %2 argument of [%3] function is missing.',
    missingKey: 'Required key %1 in %2 argument of [%3] function is missing.',
    wrongTypeArgument: 'Type of argument (%1) in function [%2] is wrong - %3. Should be %4.',
    wrongTypeKey: 'Type of key %1 in function [%2] is wrong - %3. Should be %4.',
  },
}

const WARNINGS = {
  connect: {
    disconnect: 'Service is disconnected.',
  },
}

const MESSAGES = {
  technical: {
    checkingProps: 'Service (%1) is checking the props...',
    proceedingWith: 'Service (%1) proceeding with %2...',
    foundAndChecking: 'Service (%1) found %2 and checking it...',
    running: 'Service (%1) is running.',
    willReplyThroughBus: 'Service (%1) will reply through eventBus.',
    requestingData: 'Service (%1) proceeding with request...',
    gotResponse: 'Service (%1) got response:',
    requestWithDefault: 'Service (%1) will request data with defaults:',
    endpoint: 'Service (%1) is making endpoint:',
    service: 'Service (%1) gets API service:',
  },
}

export { ERRORS, WARNINGS,MESSAGES }
