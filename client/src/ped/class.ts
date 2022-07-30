import * as alt from "alt-client"
import { InternalPed } from "./internal"

export class Ped {
  public static getByID(id: number): Ped | null {
    return InternalPed.pedsById[id]?.publicInstance ?? null
  }

  public static get streamedIn(): Ped[] {
    return [...InternalPed.streamedIn].map(p => p.publicInstance)
  }

  constructor(
    public readonly id: number,
    private readonly internalInstance: InternalPed,
  ) {}

  public get scriptID(): number {
    return this.internalInstance.gamePed.scriptID
  }

  public get pos(): alt.Vector3 {
    return new alt.Vector3(this.internalInstance.gamePed.pos)
  }

  public netOwnered(): boolean {
    return this.internalInstance.xsyncPed.netOwnered
  }
}
