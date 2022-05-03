import * as xsync from "altv-xsync-entity-client"
import type { IXSyncPedSyncedMeta } from "xpeds-sync-shared"
import { InternalPed } from "../ped/internal"

@xsync.onEntityEvents<XSyncPed>({
  streamIn: (entity) => InternalPed.onStreamIn(entity),
  streamOut: (entity) => InternalPed.onStreamOut(entity),
  posChange: (entity, pos) => InternalPed.onPosChange(entity, pos),
  syncedMetaChange: (entity, meta) => InternalPed.onSyncedMetaChange(entity, meta),
})
export class XSyncPed extends xsync.Entity<IXSyncPedSyncedMeta> {
  public static initPool(id: number): void {
    new xsync.EntityPool(id, XSyncPed)
  }
}
