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
    failedAuth: 'Service failed to authenticate, updating connectionCounter.',
    failedTo: 'Service (%1) failed to %2, proceeding with %3.',
  },
  validation: {
    emptyArgument: 'Required argument (%1) of [%2] function is empty.',
    missingArguments: 'Required argument (%1) of [%2] function is missing.',
    extraKey: 'Extra key (%1) found in %2 argument of [%3] function.',
    missingArgument: 'Required argument (%1) in %2 argument of [%3] function is missing.',
    missingKey: 'Required key %1 in %2 argument of [%3] function is missing.',
    wrongTypeArgument: 'Type of argument (%1) in function [%2] is wrong - %3. Should be %4.',
    wrongTypeKey: 'Type of key %1 in function [%2] is wrong - %3. Should be %4.',
    missingCurrencyNetwork: 'Currency and/or network is missing. Set globally on init or provide explicitly',
  },
};

const WARNINGS = {
  connect: {
    disconnect: 'Service is disconnected.',
  },
};

const MESSAGES = {
  technical: {
    checkingProps: 'Function (%1) is checking the props...',
    proceedingWith: 'Function (%1) proceeding with %2...',
    foundAndChecking: 'Function (%1) found %2 and checking it...',
    running: 'Function (%1) is running.',
    willReplyThroughBus: 'Function (%1) will reply through eventBus.',
    requestingData: 'Function (%1) proceeding with request...',
    gotResponse: 'Function (%1) got response:',
    requestWithDefault: 'Function (%1) will request data with defaults:',
    endpoint: 'Function (%1) is making endpoint:',
    service: 'Function (%1) gets API service:',
    serviceIs: 'Function is %1...',
    isAllowed: 'Function is allowed ッ',
    notAllowed: 'Function is not allowed ꈌ',
    connection: {
      wontReconnect: "Service was manually disconnected, won't reconnect",
      exceeded: 'Service exceeded connectionTriesMax (%1/%2).',
      willConnect: 'Connection is offline, but service is not - will disconnect.',
      willReConnect: 'Browser connection is online,but service is not - will re-connect.',
      willNotReconnect:
        'Browser connection is online, but service is not - service exceeded connectionTriesMax, will not re-connect.',
    },
  },
};

export { ERRORS, WARNINGS, MESSAGES };
