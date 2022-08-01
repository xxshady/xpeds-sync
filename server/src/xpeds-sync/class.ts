import type * as alt from "alt-server"
import * as xsync from "altv-xsync-entity-server"
import type { IXPedsSyncOptions } from "../types"
import { InternalXPedsSync } from "../internal-xpeds-sync"

export class XPedsSync {
  private static _instance: XPedsSync | null = null

  public static get instance(): XPedsSync {
    if (!XPedsSync._instance)
      throw new Error("xpeds sync is not initialized")

    return XPedsSync._instance
  }

  private readonly internal: InternalXPedsSync
  private readonly customClientInit: boolean

  // TODO: implement handling of user xsync
  constructor(options: IXPedsSyncOptions = {}) {
    if (XPedsSync._instance) throw new Error("xpeds sync already initialized")
    XPedsSync._instance = this

    const {
      xsync: _xsync = xsync,
      customClientInit = false, // false means: use player connect event for init
      maxStreamedIn = 50,
      streamRange = 200,
      onPedDeath = (): void => {},
      onPedNetOwnerChange = (): void => {},
      onPedStreamIn = (): void => {},
      onPedStreamOut = (): void => {},
    } = options
    this.customClientInit = customClientInit

    this.internal = new InternalXPedsSync({
      // TODO: fix "Cannot find name 'xsync' in d.ts"
      xsync: _xsync as typeof xsync,
      customClientInit,
      maxStreamedIn,
      streamRange,
      onPedDeath,
      onPedNetOwnerChange,
      onPedStreamIn,
      onPedStreamOut,
    })
  }

  public initClient(player: alt.Player): void {
    if (!this.customClientInit) {
      throw new Error(
        "[initClient] you must first set 'customClientInit' to true in the constructor," +
        " otherwise client is initiated automatically when the player connects",
      )
    }

    this.internal.initClient(player)
  }
}
