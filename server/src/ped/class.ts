import * as alt from "alt-server"
import type * as xsync from "altv-xsync-entity-server"
import type { IXSyncPedSyncedMeta } from "xpeds-sync-shared"
import { InternalPed } from "../internal-ped"
import { InternalXPedsSync } from "../internal-xpeds-sync"
import type { IPedOptions } from "./types"

export class Ped {
  private static readonly pedsById: Partial<Record<number, Ped>> = {}

  public static getByID(id: number): Ped | null {
    return Ped.pedsById[id] ?? null
  }

  private _valid = true

  private readonly internal: InternalPed

  constructor(model: number, pos: alt.IVector3, options: IPedOptions = {}) {
    const {
      dimension = alt.defaultDimension,
    } = options

    this.internal = new InternalPed(
      this,
      pos, dimension, model,
    )

    Ped.pedsById[this.internal.id] = this
  }

  public get id(): number {
    return this.internal.id
  }

  public get valid(): boolean {
    return this._valid
  }

  public get netOwner(): alt.Player | null {
    return this.internal.netOwner
  }

  public get pos(): alt.Vector3 {
    return this.internal.pos
  }

  public set pos(value: alt.IVector3) {
    this.internal.pos = value
  }

  public get health(): number {
    return this.internal.syncedMeta.health
  }

  public set health(value: number) {
    this.internal.setSyncedMeta({
      health: value,
    })
  }

  public get isDead(): boolean {
    return this.internal.isDead
  }

  public destroy(): void {
    if (!this._valid) return
    this._valid = false

    delete Ped.pedsById[this.id]
    this.internal.destroy()
  }
}
