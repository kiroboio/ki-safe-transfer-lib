import dotenv from 'dotenv';

import Service, { AuthDetails } from '../src';
import { wait } from './tools';

dotenv.config();

const controlDetails: AuthDetails = { key: 'testKey', secret: 'testSecret' };

process.on('unhandledRejection', () => {
  return;
});

describe('Authentication', () => {
  it('throws error on incorrect auth details', async () => {
    expect.assertions(1);

    try {
      // @ts-ignore
      Service.createInstance({ test: 'test' });
    } catch (err) {
      expect(err.message).toEqual('Data is malformed. [authDetails] has less or extra keys.');
    }
  });
  it('no authentication with incorrect auth details', async () => {
    expect.assertions(1);

    const incorrect = Service.createInstance(controlDetails);

    await wait(2000);

    const r = incorrect.isAuthorized();

    expect(r).toEqual(false);
  });
});
