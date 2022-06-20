# Very experimental peds sync for [alt:V](https://altv.mp) platform (WIP)

## Installation
```
npm i xpeds-sync-client xpeds-sync-server
```

## Usage example:

### client
```ts
import * as xpeds from "xpeds-sync-client"

// initialize peds sync
new xpeds.XPedsSync({
  nametags: true,
  onPedStreamIn: (ped) => {
    console.log("ped entered streaming range (spawned in the game)")
  },
  onPedStreamOut: (ped) => {
    console.log("ped left streaming range (destroyed in the game)")
  },
  onPedNetOwnerChange: (ped, netOwner) => {
    if (!netOwner) {
      console.log("player is not netowner")
      return
    }
    console.log("player is netowner, give a ped task")

    const { x, y, z } = alt.Player.local.pos
    native.taskGoToCoordAnyMeans(ped.scriptID, x, y, z, 5.0, 0, false, 786603, 0)
  },
})

xpeds.Ped.streamedIn // all streamed in peds (just like alt.Player.streamedIn)
```

### server

```ts
import * as xpeds from "xpeds-sync-server"

new xpeds.XPedsSync()
// you can also customize stream range, max streamed in (how many closest peds can be spawned in the game)
new xpeds.XPedsSync({
  streamRange: 10,
  maxStreamedIn: 3, // 3 peds for each client
})

for (let i = 0; i < 1; ++i)
  new xpeds.Ped(alt.hash("mp_m_freemode_01"), new alt.Vector3(0, 0, 72))
```

### example of custom client init (connection to websocket sync server)

```ts
// serverside
import * as alt from "alt-server"
import * as xpeds from "xpeds-sync-server"

new xpeds.XPedsSync({
  customClientInit: true,
})

alt.on("playerConnect", (player) => {
  alt.setTimeout(() => {
    xpedsInstance.initClient(player)
  }, 1000)
})
```
