import { Connect } from './connect';
import { AnyValue, Maybe, AuthDetails, MessageCallback } from './types/types';
import { Type } from './tools';
import { validateAuthDetails } from './validators';

class Service extends Connect {
  private static instance: Service;

  public static getInstance(): Maybe<Service> {
    return Service.instance;
  }

  public static createInstance(authDetails: AuthDetails, messageCallback?: MessageCallback): Service {
    validateAuthDetails(authDetails);

    if (Service.instance) this.disconnect();

    Service.instance = new Service(authDetails, messageCallback);

    return Service.instance;
  }

  public static disconnect(): void {
    if (Service.instance) Service.instance._disconnect();

    delete Type<AnyValue>(Service)?.instance;
  }

  private constructor(authDetails: AuthDetails, messageCallback?: MessageCallback) {
    super(authDetails, messageCallback);
  }
}

export { Service };
