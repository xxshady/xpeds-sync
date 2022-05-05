import * as alt from "alt-client"
import type { IXSyncPedSyncedMeta } from "xpeds-sync-shared"
import { Logger } from "xpeds-sync-shared"
import { XSyncPed } from "../../xsync-ped"
import { Ped } from "../class"
import { GamePed } from "../game"
import { NetOwnerPed } from "../net-owner/class"
import { ObserverPed } from "../observer"

const log = new Logger("internal-ped")

export class InternalPed {
  public static readonly streamedIn = new Set<InternalPed>()

  private static readonly pedsByXsync = new Map<XSyncPed, InternalPed>()

  public static onStreamIn(xsyncPed: XSyncPed): void {
    log.log("onStreamIn", "ped id:", xsyncPed.id)

    InternalPed.pedsByXsync.set(xsyncPed, new InternalPed(xsyncPed))
  }

  public static onStreamOut(xsyncPed: XSyncPed): void {
    log.log("onStreamOut", "ped id:", xsyncPed.id)

    const ped = InternalPed.pedsByXsync.get(xsyncPed)
    if (!ped) return

    ped.destroy()
    InternalPed.pedsByXsync.delete(xsyncPed)
  }

  public static onSyncedMetaChange(xsyncPed: XSyncPed, meta: Partial<IXSyncPedSyncedMeta>): void {
    log.log("onSyncedMetaChange", "ped id:", xsyncPed.id, meta)

    const ped = InternalPed.pedsByXsync.get(xsyncPed)
    if (!ped) return

    if (!ped.netOwnerPed) return

    const {
      health,
    } = meta

    if (health != null) {
      alt.nextTick(() => {
        ped.gamePed.health = health
      })
    }
  }

  public static onPosChange(xsyncPed: XSyncPed, pos: alt.IVector3): void {
    // log.log("onPosChange", "ped id:", xsyncPed.id, pos.x, pos.y)

    const ped = InternalPed.pedsByXsync.get(xsyncPed)
    if (!ped) return

    if (!ped.netOwnerPed) return
    ped.gamePed.pos = pos
  }

  public static onNetOwnerChange(xsyncPed: XSyncPed, netOwnered: boolean): void {
    log.log("onNetOwnerChange", xsyncPed.id, netOwnered)

    const ped = InternalPed.pedsByXsync.get(xsyncPed)
    if (!ped) return

    netOwnered ? ped.initNetOwner() : ped.removeNetOwner(true)
  }

  public readonly publicInstance: Ped
  public readonly gamePed: GamePed

  private valid = true
  private netOwnerPed: NetOwnerPed | null = null
  private observerPed: ObserverPed | null = null

  constructor(public readonly xsyncPed: XSyncPed) {
    const {
      id,
      pos,
      syncedMeta,
    } = xsyncPed

    this.publicInstance = new Ped(
      id,
      this,
    )

    this.gamePed = new GamePed(
      xsyncPed,
      {
        pos,
        model: syncedMeta.model,
        health: syncedMeta.health,
      })

    this.gamePed.waitForSpawn()
      .then(() => {
        if (!xsyncPed.netOwnered)
          this.observerPed = new ObserverPed(this)
      })
      .catch(e => log.error("gamePed.waitForSpawn", e.stack))

    InternalPed.streamedIn.add(this)
  }

  public sendNetOwnerPosUpdate(pos: alt.IVector3): void {
    XSyncPed.pool.updateNetOwnerPos(this.xsyncPed, pos)
  }

  public sendNetOwnerSyncedMetaUpdate(meta: Partial<IXSyncPedSyncedMeta>): void {
    XSyncPed.pool.updateNetOwnerSyncedMeta(this.xsyncPed, meta)
  }

  private destroy(): void {
    if (!this.valid) return
    this.valid = false

    this.gamePed.destroy()
    this.observerPed?.destroy()
    this.removeNetOwner(false)

    InternalPed.streamedIn.delete(this)
  }

  private initNetOwner(): void {
    if (this.netOwnerPed)
      throw new Error("initNetOwner netOwner already created")

    this.gamePed.waitForSpawn()
      .then(() => {
        if (!this.xsyncPed.netOwnered) return

        this.netOwnerPed = new NetOwnerPed(this)

        if (this.observerPed) {
          this.observerPed.destroy()
          this.observerPed = null
        }
      })
      .catch(e => log.error("gamePed.waitForSpawn", e.stack))
  }

  private removeNetOwner(createObserver: boolean): void {
    this.gamePed.waitForSpawn()
      .then(() => {
        if (!this.netOwnerPed) return
        if (this.xsyncPed.netOwnered) return

        this.netOwnerPed.destroy()
        this.netOwnerPed = null

        if (!createObserver) return
        if (this.observerPed)
          throw new Error("xpeds sync removeNetOwner observerPed already created")

        this.observerPed = new ObserverPed(this)
      })
      .catch(e => log.error("gamePed.waitForSpawn", e.stack))
  }
}
