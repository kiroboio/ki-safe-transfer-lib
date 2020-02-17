


```TypeScript

function eventBus(event: Event) {
  console.log('event fired: ', event)
  // event fired:  {
  //   type: 'service_update_status',
  //   payload: { height: 1665000, online: true }
  // }
  // event fired:  {
  //   type: 'service_update_status',
  //   payload: { height: 1665001, online: true }
  // }
  // event fired:  {
  //   type: 'service_update_status',
  //   payload: { height: 1665002, online: true }
  // }
}

const service = new Service({ eventBus })

```