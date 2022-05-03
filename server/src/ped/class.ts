import type * as alt from "alt-server"
import { XPedsSync } from "../xpeds-sync"
import type * as xsync from "altv-xsync-entity-server"

export class Ped {
  private readonly xsyncInstance: xsync.Entity

  constructor(model: number, pos: alt.IVector3) {
    this.xsyncInstance = new XPedsSync.instance.XSyncPed(
      pos,
      {
        health: 200,
        model,
      },
    )
  }
}
