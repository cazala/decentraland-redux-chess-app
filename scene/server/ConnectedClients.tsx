import RemoteScene from './RemoteScene'
import store from './Store'

export const connectedClients: Set<RemoteScene> = new Set()

store.subscribe(() => {
  connectedClients.forEach(function each(client) {
    client.forceUpdate()
  })
})
