import type * as alt from "alt-client"
import type { InternalPed } from "./internal"

export class Ped {
  constructor(
    public readonly id: number,
    // TODO: use pos from game ped
    public readonly pos: alt.Vector3,
    private readonly internalInstance: InternalPed,
  ) {}
}
