import * as alt from "alt-server"
import type { IXSyncPedSyncedMeta } from "xpeds-sync-shared"
import { InternalXPedsSync } from "../internal-xpeds-sync"
import type { Ped } from "../ped"
import type { XSyncPed } from "../xsync-ped"

export class InternalPed {
  public static readonly internalPedByXsyncPed = new Map<XSyncPed, InternalPed>()

  public static handleSyncedMetaChange(
    xsyncPed: XSyncPed,
    changedMeta: Partial<Readonly<IXSyncPedSyncedMeta>>,
    byPlayer: alt.Player | null,
  ): void {
    const internalPed = InternalPed.internalPedByXsyncPed.get(xsyncPed)
    if (!internalPed)
      throw new Error(`xpeds sync handleSyncedMetaChange unknown xsync ped: ${xsyncPed.id}`)

    const { health } = changedMeta

    if (health != null) {
      if (health <= 0 && !internalPed.isDead) {
        internalPed.isDead = true

        InternalXPedsSync.instance.pedDeathHandler(internalPed.publicInstance, byPlayer)
      }
      else if (health >= 0 && internalPed.isDead)
        internalPed.isDead = false
    }
  }

  private readonly xsyncInstance: XSyncPed
  public readonly id: number
  public isDead = false

  constructor(
    public readonly publicInstance: Ped,
    pos: alt.IVector3,
    dimension: number,
    model: number,
  ) {
    this.xsyncInstance = new InternalXPedsSync.instance.XSyncPed(
      pos,
      dimension,
      {
        health: 200,
        model,
        ragdoll: 0,
        isWalking: 0,
        heading: 0,
        insideVehicle: 0,
        vehicle: 0,
      },
    )

    this.id = this.xsyncInstance.id

    InternalPed.internalPedByXsyncPed.set(this.xsyncInstance, this)
  }

  public get pos(): alt.Vector3 {
    return new alt.Vector3(this.xsyncInstance.pos)
  }

  public set pos(pos: alt.IVector3) {
    this.pos = pos
  }

  public get netOwner(): alt.Player | null {
    return this.xsyncInstance.netOwner
  }

  public get syncedMeta(): Readonly<IXSyncPedSyncedMeta> {
    return this.xsyncInstance.syncedMeta
  }

  public setSyncedMeta(meta: Partial<IXSyncPedSyncedMeta>): void {
    this.xsyncInstance.setSyncedMeta(meta)
  }

  public destroy(): void {
    InternalPed.internalPedByXsyncPed.delete(this.xsyncInstance)
    this.xsyncInstance.destroy()
  }
}
