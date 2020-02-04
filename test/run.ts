import Service, { DebugLevels, Currencies, Networks, Responses, Event } from '../src/'

function eventBus(event: Event) {
  console.log('event fired: ', event)
}

const service = new Service({})

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
// async function run() {
// const res = await service.getCollectables('mrqQsrjG65QiE1xMTbKNBnX7qKgthy2XCp')
// const res = await service.getRetrievable('6a7acf1cdd7d35f3d86aa005c09cd27ac71bc1fc0c71454f3d9938fb88250edd0000')
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
//   const result = await service.getStatus()
//   console.log(result)
// }

// run()

// service.getCollectables('mrqQsrjG65QiE1xMTbKNBnX7qKgthy2XCp')
