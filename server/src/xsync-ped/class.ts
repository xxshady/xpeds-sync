import type * as alt from "alt-server"
import { Logger } from "xpeds-sync-shared"
import type { IXSyncPedSyncedMeta } from "xpeds-sync-shared"
import type { XSyncPedClass } from "./types"
import * as xsync from "altv-xsync-entity-server"
import { InternalPed } from "../internal-ped"

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
        maxStreamedIn,
      })

      log.log("created ped pool id:", pedPool.id)
      break
    }
    catch {}
  }

  @xsync.onEntityEvents<XSyncPed>(pedPool, {
    syncedMetaChange: (ped, changedMeta, byPlayer) => {
      InternalPed.handleSyncedMetaChange(ped, changedMeta, byPlayer)
    },
  })
  class XSyncPed extends Entity<IXSyncPedSyncedMeta> {
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
        dimension,
        streamRange,
      )
    }
  }

  return XSyncPed
}
