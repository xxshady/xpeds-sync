import type * as alt from "alt-server"
import type * as xsync from "altv-xsync-entity-server"
import type { IXSyncPedSyncedMeta } from "xpeds-sync-shared"

export type XSyncPedClass = {
  pool: xsync.EntityPool
  new (pos: alt.IVector3, syncedMeta: IXSyncPedSyncedMeta): xsync.Entity
}
