import * as xsync from "altv-xsync-entity-client"
import type { IXSyncPedSyncedMeta } from "xpeds-sync-shared"
import { InternalPed } from "../ped/internal"

@xsync.onEntityEvents<XSyncPed>({
  streamIn: (entity) => InternalPed.onStreamIn(entity),
  streamOut: (entity) => InternalPed.onStreamOut(entity),
  posChange: (entity, pos) => InternalPed.onPosChange(entity, pos),
  syncedMetaChange: (entity, meta) => InternalPed.onSyncedMetaChange(entity, meta),
  netOwnerChange: (entity, netOwnered) => InternalPed.onNetOwnerChange(entity, netOwnered),
})
export class XSyncPed extends xsync.Entity<IXSyncPedSyncedMeta> {
  private static _pool: xsync.EntityPool<XSyncPed> | null = null

  public static get pool(): xsync.EntityPool<XSyncPed> {
    if (!XSyncPed._pool)
      throw new Error("xsyncped pool is not initialized")

    return XSyncPed._pool
  }

  public static initPool(id: number): void {
    XSyncPed._pool = new xsync.EntityPool(id, XSyncPed)
  }
}
