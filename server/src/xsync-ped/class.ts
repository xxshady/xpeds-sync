import type * as alt from "alt-server"
import { Logger } from "xpeds-sync-shared"
import type { IXSyncPedSyncedMeta } from "xpeds-sync-shared"
import type { XSyncPedClass } from "./types"
import type * as xsync from "altv-xsync-entity-server"

const log = new Logger("xsync-ped")

export const InitXSyncPed = (
  {
    Entity,
    EntityPool,
  }: typeof xsync,
  maxStreamedIn: number,
  streamRange: number,
): XSyncPedClass => {
  let id = 0
  let pedPool: xsync.EntityPool

  while (true) {
    try {
      pedPool = new EntityPool(id++, {
        // TODO: add user option for this
        maxStreamedIn,
      })

      log.log("created ped pool id:", pedPool.id)
      break
    }
    catch {}
  }

  return class XSyncPed extends Entity<IXSyncPedSyncedMeta> {
    public static pool = pedPool

    constructor(
      pos: alt.IVector3,
      dimension: number,
      syncedMeta: IXSyncPedSyncedMeta,
    ) {
      super(
        pedPool,
        pos,
        syncedMeta,
        {},
        // TODO: add user options for these
        dimension,
        streamRange,
      )
    }
  }
}
