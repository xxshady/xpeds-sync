import * as alt from "alt-client"
import type { IXSyncPedSyncedMeta } from "xpeds-sync-shared"
import { Logger } from "xpeds-sync-shared"
import type { XSyncPed } from "../../xsync-ped"
import { Ped } from "../class"
import { GamePed } from "../game"

const log = new Logger("internal-ped")

export class InternalPed {
  public static onStreamIn(ped: XSyncPed): void {
    log.log("onStreamIn", "ped id:", ped.id)
    new InternalPed(ped)
  }

  public static onStreamOut(ped: XSyncPed): void {
  }

  public static onSyncedMetaChange(ped: XSyncPed, meta: Partial<IXSyncPedSyncedMeta>): void {

  }

  public static onPosChange(ped: XSyncPed, pos: alt.IVector3): void {

  }

  private readonly publicInstance: Ped

  constructor(ped: XSyncPed) {
    const {
      id,
      pos,
      syncedMeta,
    } = ped

    this.publicInstance = new Ped(
      id,
      new alt.Vector3(pos),
      this,
    )

    new GamePed(
      ped,
      {
        pos,
        model: syncedMeta.model,
        health: syncedMeta.health,
      })
  }
}
