import { Service } from './dist';

const AuthDetails = {
  key: 'kirobo',
  secret: 'kirobodev',
};
const client = Service.createInstance(AuthDetails, 'http://testapi.kirobo.me/');
client.connect();

const tokens = client.getService('v1/eth/rinkeby/vault/tokens');
const wallets = await tokens.find({
  address: '',
});

console.log(wallets);
