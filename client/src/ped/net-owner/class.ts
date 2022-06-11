import * as alt from "alt-client"
import type { WSBoolean } from "altv-xsync-entity-shared"
import type { IXSyncPedSyncedMeta } from "xpeds-sync-shared"
import type { InternalPed, IPedController } from "../internal"

export class NetOwnerPed implements IPedController {
  private static POS_INTERVAL_MS = 80
  private static META_INTERVAL_MS = 100

  private readonly posInterval = alt.setInterval(
    this.posIntervalHandler.bind(this),
    NetOwnerPed.POS_INTERVAL_MS,
  )

  private readonly metaInterval = alt.setInterval(
    this.metaIntervalHandler.bind(this),
    NetOwnerPed.META_INTERVAL_MS,
  )

  private prevHealth: number
  private prevHeading: number
  private prevRagdoll: boolean
  private prevIsWalking: boolean
  private prevPos: alt.IVector3 = alt.Vector3.zero

  constructor(
    private readonly internalPed: InternalPed,
  ) {
    const {
      heading,
      health,
      isWalking,
      ragdoll,
    } = internalPed.xsyncPed.syncedMeta

    this.prevRagdoll = !!ragdoll
    this.prevIsWalking = !!isWalking
    this.prevHealth = health
    this.prevHeading = heading
  }

  public destroy(): void {
    alt.clearInterval(this.metaInterval)
    alt.clearInterval(this.posInterval)
  }

  private posIntervalHandler(): void {
    const { pos } = this.internalPed.gamePed
    if (
      +pos.x.toFixed(3) === +this.prevPos.x.toFixed(3) &&
      +pos.y.toFixed(3) === +this.prevPos.y.toFixed(3) &&
      +pos.z.toFixed(3) === +this.prevPos.z.toFixed(3)
    ) return

    this.prevPos = pos
    this.internalPed.sendNetOwnerPosUpdate(pos)
  }

  private metaIntervalHandler(): void {
    if (!this.internalPed.gamePed.scriptID) return

    const updatedMeta: Partial<IXSyncPedSyncedMeta> = {}

    let {
      heading,
    } = this.internalPed.gamePed
    const {
      health,
      ragdoll,
      isWalking,
    } = this.internalPed.gamePed

    if (this.prevHealth !== health) {
      updatedMeta.health = health
      this.prevHealth = health
    }

    if (health > 0) {
      heading = +heading.toFixed(1)
      if (this.prevHeading !== heading) {
        updatedMeta.heading = heading
        this.prevHeading = heading
      }

      if (this.prevRagdoll !== ragdoll) {
        updatedMeta.ragdoll = +ragdoll as WSBoolean
        this.prevRagdoll = ragdoll
      }

      // TODO: inspect bug with walking (ped idle but iswalking on server set as true)
      if (this.prevIsWalking !== isWalking) {
        updatedMeta.isWalking = +isWalking as WSBoolean
        this.prevIsWalking = isWalking
      }
    }

    if (Object.keys(updatedMeta).length > 0)
      this.internalPed.sendNetOwnerSyncedMetaUpdate(updatedMeta)
  }
}
