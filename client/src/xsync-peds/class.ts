import * as alt from "alt-client"
import { AltClientEvents, Logger } from "xpeds-sync-shared"
import type { IAltClientEvent } from "xpeds-sync-shared/src/events"
import { XSyncPed } from "../xsync-ped/class"

export class XPedsSync {
  private readonly log = new Logger("main")

  private readonly onServerEvents: { [K in AltClientEvents]: (...args: IAltClientEvent[K]) => void } = {
    [AltClientEvents.Init]: (pedPoolId) => {
      this.log.log("onServer init ped pool:", pedPoolId)

      XSyncPed.initPool(pedPoolId)
    },
  }

  constructor() {
    for (const eventName in this.onServerEvents)
      alt.onServer(eventName, this.onServerEvents[eventName as AltClientEvents])
  }
}
