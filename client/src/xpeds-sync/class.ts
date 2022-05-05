import * as alt from "alt-client"
import * as xsync from "altv-xsync-entity-client"
import { AltClientEvents, Logger } from "xpeds-sync-shared"
import type { IAltClientEvent } from "xpeds-sync-shared"
import { XSyncPed } from "../xsync-ped"
import type { IXPedsSyncOptions } from "./types"
import { PedNametags } from "./nametags"

export class XPedsSync {
  private static _instance: XPedsSync | null = null

  public static get instance(): XPedsSync {
    if (!XPedsSync._instance)
      throw new Error("xpeds sync is not initialized")

    return XPedsSync._instance
  }

  private readonly log = new Logger("main")

  private readonly onServerEvents: { [K in AltClientEvents]: (...args: IAltClientEvent[K]) => void } = {
    [AltClientEvents.Init]: (pedPoolId) => {
      this.log.log("onServer init ped pool:", pedPoolId)

      XSyncPed.initPool(pedPoolId)
    },
  }

  // TODO: implement handling of user xsync
  constructor(_xsync = xsync, options: IXPedsSyncOptions = {}) {
    if (XPedsSync._instance) throw new Error("xpeds sync already initialized")
    XPedsSync._instance = this

    new _xsync.XSyncEntity()

    for (const eventName in this.onServerEvents)
      alt.onServer(eventName, this.onServerEvents[eventName as AltClientEvents])

    const {
      nametags = false,
    } = options

    if (nametags) new PedNametags({})
  }
}
