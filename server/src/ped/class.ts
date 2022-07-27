import * as alt from "alt-server"
import { InternalPed } from "../internal-ped"
import type { IPedOptions } from "./types"

export class Ped {
  private static readonly pedsById: Partial<Record<number, Ped>> = {}
  public static readonly all: readonly Ped[] = []

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

    Ped.pedsById[this.internal.id] = this;
    (Ped.all as Ped[]).push(this)
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

    const idx = Ped.all.indexOf(this)
    if (idx !== -1)
      (Ped.all as Ped[]).splice(idx, 1)

    this.internal.destroy()
  }

  public setNetOwner(player: alt.Player, disableMigration?: boolean): void {
    this.internal.xsyncInstance.setNetOwner(player, disableMigration)
  }

  public resetNetOwner(): void {
    this.internal.xsyncInstance.resetNetOwner()
  }
}
