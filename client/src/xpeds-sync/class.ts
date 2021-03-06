import * as alt from "alt-client"
import * as xsync from "altv-xsync-entity-client"
import type { IAltClientEvent, IAltServerEvent } from "xpeds-sync-shared"
import { AltClientEvents, Logger, AltServerEvents } from "xpeds-sync-shared"

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

      this.emitAltServer(AltServerEvents.InitResponse)
    },
  }

  public readonly onPedStreamIn: IXPedsSyncOptions["onPedStreamIn"]
  public readonly onPedStreamOut: IXPedsSyncOptions["onPedStreamOut"]
  public readonly onPedNetOwnerChange: IXPedsSyncOptions["onPedNetOwnerChange"]

  // TODO: implement handling of user xsync
  constructor(options: IXPedsSyncOptions = {}) {
    if (XPedsSync._instance) throw new Error("xpeds sync already initialized")
    XPedsSync._instance = this

    for (const eventName in this.onServerEvents)
      alt.onServer(eventName, this.onServerEvents[eventName as AltClientEvents])

    const {
      nametags = false,
      xsync: _xsync = xsync,
      onPedStreamIn,
      onPedStreamOut,
      onPedNetOwnerChange,
    } = options

    new _xsync.XSyncEntity()

    if (nametags) new PedNametags({})

    this.onPedStreamIn = onPedStreamIn
    this.onPedStreamOut = onPedStreamOut
    this.onPedNetOwnerChange = onPedNetOwnerChange
  }

  private emitAltServer <K extends AltServerEvents>(eventName: K, ...args: IAltServerEvent[K]): void {
    alt.emitServerRaw(eventName, ...args)
  }
}
