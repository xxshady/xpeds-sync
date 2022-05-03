import type * as alt from "alt-server"
import type * as xsync from "altv-xsync-entity-server"
import { Logger } from "xpeds-sync-shared"
import type { IXSyncPedSyncedMeta } from "xpeds-sync-shared"
import type { XSyncPedClass } from "./types"

const log = new Logger("xsync-ped")

export const InitXSyncPed = ({
  Entity,
  EntityPool,
}: typeof xsync): XSyncPedClass => {
  let id = 0
  let pedPool: xsync.EntityPool

  while (true) {
    try {
      pedPool = new EntityPool(id++, {
        // TODO: add user option for this
        maxStreamedIn: 10,
      })

      log.log("created ped pool id:", pedPool.id)
      break
    } catch {}
  }

  return class XSyncPed extends Entity {
    public static pool = pedPool

    constructor(pos: alt.IVector3, syncedMeta: IXSyncPedSyncedMeta) {
      super(
        pedPool,
        pos,
        syncedMeta,
        {},
        // TODO: add user options for these
        0,
        50,
        50,
      )
    }
  }
}
