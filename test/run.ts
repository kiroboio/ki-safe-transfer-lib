import Service, { DebugLevels, Currencies, Networks, Responses, Event, Sendable } from '../src/'

function eventBus(event: Event) {
  console.log('event fired: ', event)
}

// const service = new Service({})
const service = new Service({
  respond: Responses.Callback,
  eventBus,
})

// const sendable: Sendable = {
//   amount: 100000,
//   collect:
//     '01000000000101009c540eab4f16fae80e3acb5339efcfa57e61280ceb03d4392f8a6bcad5fb2e0000000017a1a971269479a32828559e3943efb49f1974f2ae41bdb9ffffff0001a08601000000000017a9140e97843e5e7d93bed5dd3f14e1fb94454e95d207870248476c07816332fd764b7ee92e44fb19921a739293a04132200f93fefa1bc1e42b0bb1d7f766424711659d788f56ad96808837a7c5a5b95635cb4a5c46f1c36e593b25c0b99b60768621942ebe77a89d98a4096ca52684e477cce7a6a5f6d2d695bf29a89963038a334a9d00000000',
//   deposit:
//     '010000000001024c3fde11438a83635257ef6ec1789b6eae382ef55a71bb400a5f6b4fb85eaa560100000017160014622b0410f7288799031b21eca66e9c3c67d9cf80ffffff00ff5b3c157a14b94c1382e8fbb2fe574a29f4a587dce1e6d222926be6e1b849590000000017160014d05d0b655565626c51d2d277667bcd21239630a1ffffff0002b0ad01000000000017a91456fbdacba78d79595d0637b9d6a7d3b5288d835f87582401000000000017a91483c632474be58705056a0e952668006845a2eca98702483045022100957092224ce821dd7eb1992ee86d8aad7b47a8651fe1b9e7e52c2fc53b6f257902204d533cd670de63ee709e08e3b46b05b72a3dee0c6b4c95382aad96350a2403e90121031c1c9c8184cf90ea652fc515b1e6c1bca196d52dd409b44808879568f665275102473044022035f55be06314716f86bcf6711c82f6e431e13ba5f24624367832812681bc5329022071d20a13299d38a8c7d68b3712c5d7d7c7705b9ec507168cc506f4550ef7c52d012102b179c7d7816bb491322034dc9b5d80efa6ebeac2d1f8c47e18cbe0f345d906e500000000',
//   from: 'from me',
//   // hash: '2efbd5ca6b8a2f39d403eb0c28617ea5cfef3953cb3a0ee8fa164fab0e549c00',
//   hint: '2MtaNxXTLMqDd7yWVn5tYvyUiWRzgZY5Pm6',
//   // id: 'hash;2efbd5ca6b8a2f39d403eb0c28617ea5cfef3953cb3a0ee8fa164fab0e549c00',
//   to: '2MtaNxXTLMqDd7yWVn5tYvyUiWRzgZY5Pm6',
// }

// const service = new Service({
//   debug: DebugLevels.QUIET,
//   network: Networks.Testnet,
//   currency: Currencies.Bitcoin,
//   respond: Responses.Direct,
//   eventBus,
// })
// const service = new Service({})
// console.log(Object.keys(service))
// const result = service.getSettings()
// console.log(result)

// console.log(service.getStatus())
// console.log(service)
// const res = await service.getCollectables('mrqQsrjG65QiE1xMTbKNBnX7qKgthy2XCp')
// const res = await service.getRetrievable('6a7acf1cdd7d35f3d86aa005c09cd27ac71bc1fc0c71454f3d9938fb88250edd0000')
// async function run() {

// const res = await service.send({
//   to: 'string',
//   from: 'string',
//   hint: 'string',
//   collect: 'string',
//   deposit: 'string',
//   amount: 1,
//   key: 'string',
// })
// async function run() {
//   const result = await service.getRetrievable('7c17d7b6d7c3f1ee910f5438125bac30a2ea6db145b91b7bd5359a31f9ad0e3c0000')
//   console.log(result)
// }

// run()
// service.getRetrievable('7c17d7b6d7c3f1ee910f5438125bac30a2ea6db145b91b7bd5359a31f9ad0e3c0000')

// service.getCollectables('2MtaNxXTLMqDd7yWVn5tYvyUiWRzgZY5Pm6')

// const transaction = {
//   id: 'dec962629088b1ae2fa9ecd72a6f74a8a8016f91e1239988fd9701069837d3cb',
//   key: '0001e1427f025796fbc9e64219937accbf61bb1ed19037fdae15eedfe4c4373bd1e3',
// }

const transaction = {
  id: 'dec962629088b1ae2fa9ecd72a6f74a8a8016f91e1239988fd9701069837d3cb',
  key: '0001e1427f025796fbc9e64219937accbf61bb1ed19037fdae15eedfe4c4373bd1e3',
}

// Service (collect):  {
//   fromNodeTxid: '3792c7051d0f914264057b400bc2649ddaec1b671a6c953a39838cf8a7940595'
// }

// service.collect(transaction)

// service.getCollectables('mrqQsrjG65QiE1xMTbKNBnX7qKgthy2XCp')\

// Service (collect) got an error. Transaction Rejected by the Blockchain