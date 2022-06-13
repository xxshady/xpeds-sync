import * as alt from "alt-server"
import { XPedsSync } from "../xpeds-sync"
import type * as xsync from "altv-xsync-entity-server"
import type { IXSyncPedSyncedMeta } from "xpeds-sync-shared"

export class Ped {
  private static readonly pedsById: Partial<Record<number, Ped>> = {}

  public static getByID(id: number): Ped | null {
    return Ped.pedsById[id] ?? null
  }

  private readonly xsyncInstance: xsync.Entity<IXSyncPedSyncedMeta>
  private _valid = true

  constructor(model: number, pos: alt.IVector3) {
    this.xsyncInstance = new XPedsSync.instance.XSyncPed(
      pos,
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

    Ped.pedsById[this.xsyncInstance.id] = this
  }

  public get id(): number {
    return this.xsyncInstance.id
  }

  public get valid(): boolean {
    return this._valid
  }

  public get netOwner(): alt.Player | null {
    return this.xsyncInstance.netOwner
  }

  public get pos(): alt.Vector3 {
    return new alt.Vector3(this.xsyncInstance.pos)
  }

  public set pos(value: alt.IVector3) {
    this.xsyncInstance.pos = value
  }

  public get health(): number {
    return this.xsyncInstance.syncedMeta.health
  }

  public set health(value: number) {
    this.xsyncInstance.setSyncedMeta({
      health: value,
    })
  }

  public destroy(): void {
    if (!this._valid) return
    this._valid = false

    delete Ped.pedsById[this.id]
    this.xsyncInstance.destroy()
  }
}
