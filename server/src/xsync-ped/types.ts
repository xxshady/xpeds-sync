import type * as alt from "alt-server"
import type { IXSyncPedSyncedMeta } from "xpeds-sync-shared"
import type * as xsync from "altv-xsync-entity-server"

export type XSyncPedClass = {
  pool: xsync.EntityPool
  new (
    pos: alt.IVector3,
    dimension: number,
    syncedMeta: IXSyncPedSyncedMeta
  ): xsync.Entity<IXSyncPedSyncedMeta>
}
