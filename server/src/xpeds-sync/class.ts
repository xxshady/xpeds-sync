import * as alt from "alt-server"
import * as xsync from "altv-xsync-entity-server"
import type { IAltClientEvent } from "xpeds-sync-shared"
import { AltClientEvents, Logger } from "xpeds-sync-shared"
import { Ped } from "../ped"
import { InitXSyncPed } from "../xsync-ped"
import type { XSyncPedClass } from "../xsync-ped"

export class XPedsSync {
  private static _instance: XPedsSync | null = null

  public static get instance(): XPedsSync {
    if (!XPedsSync._instance)
      throw new Error("xpeds sync is not initialized")

    return XPedsSync._instance
  }

  private readonly log = new Logger("main")

  public readonly XSyncPed: XSyncPedClass

  constructor(_xsync = xsync) {
    // TODO: implement handling of user xsync
    new _xsync.XSyncEntity(
      300,
      {
        localhost: true,
      },
      {
        entityNetOwnerChange: this.onEntityNetOwnerChange.bind(this),
      },
    )

    this.XSyncPed = InitXSyncPed(_xsync)

    alt.on("playerConnect", this.onPlayerConnect)
  }

  private emitAltClient <K extends AltClientEvents>(player: alt.Player, eventName: K, ...args: IAltClientEvent[K]): void {
    player.emit(eventName, ...args)
  }

  private onEntityNetOwnerChange(
    entity: xsync.Entity,
    netOwner: alt.Player | null,
    oldNetOwner: alt.Player | null,
  ): void {
    if (!(entity instanceof Ped)) return

    this.log.log("onEntityNetOwnerChange", entity.id, oldNetOwner?.name, "->", netOwner?.name)
  }

  // TODO: add async player adder to xsync (xsync can send events before peds sync init on clientside)
  private onPlayerConnect(player: alt.Player): void {
    this.emitAltClient(player, AltClientEvents.Init, this.XSyncPed.pool.id)
  }
}
