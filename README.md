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

for (let i = 0; i < 1; ++i)
  new xpeds.Ped(alt.hash("mp_m_freemode_01"), new alt.Vector3(0, 0, 72))
```

## TODO

- add async player adder to xsync (xsync can send events before peds sync init on clientside)
