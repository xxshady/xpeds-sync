import * as alt from "alt-client"
import { Logger } from "xpeds-sync-shared"
import type { InternalPed, IPedController } from "../internal"

export class ObserverPed implements IPedController {
  private log: Logger
  private prevRagdoll = false
  private startRagdollTime = 0

  constructor(private readonly internalPed: InternalPed) {
    this.log = new Logger(`observer: ${internalPed.xsyncPed.id}`)
  }

  private readonly posTick = alt.everyTick(
    this.posTickHandler.bind(this),
  )

  private readonly metaTick = alt.everyTick(
    this.metaTickHandler.bind(this),
  )

  public destroy(): void {
    alt.clearEveryTick(this.posTick)
    alt.clearEveryTick(this.metaTick)
  }

  private posTickHandler(): void {
    const {
      gamePed,
      xsyncPed: {
        pos: targetPos,
        syncedMeta,
      },
    } = this.internalPed

    const dist = gamePed.pos.distanceTo(targetPos)

    if (dist > 5.0) {
      gamePed.pos = targetPos
      return
    }

    if (!syncedMeta.health) return
    if (!syncedMeta.ragdoll) return

    // TODO: fix wooden ragdoll

    const multiplier = syncedMeta.isWalking ? 2.5 : 4.0
    gamePed.setVelocity({
      x: (this.internalPed.xsyncPed.pos.x - gamePed.pos.x) * multiplier,
      y: (this.internalPed.xsyncPed.pos.y - gamePed.pos.y) * multiplier,
      z: (this.internalPed.xsyncPed.pos.z - gamePed.pos.z) * multiplier,
    })
  }

  private metaTickHandler(): void {
    const {
      pos,
      syncedMeta: {
        health,
        isWalking,
        heading,
      },
    } = this.internalPed.xsyncPed

    if (!health) {
      this.internalPed.gamePed.health = 0
      return
    }

    let {
      ragdoll,
    } = this.internalPed.xsyncPed.syncedMeta as { ragdoll: boolean | number }
    ragdoll = !!ragdoll

    const { gamePed } = this.internalPed
    const now = Date.now()

    this.internalPed.gamePed.ragdoll = ragdoll
    if (this.prevRagdoll !== ragdoll) {
      if (ragdoll) this.startRagdollTime = now
      this.prevRagdoll = ragdoll
    }

    if ((now - this.startRagdollTime) < 75) {
      alt.setRotationVelocity(
        gamePed.scriptID,
        Math.random() * 5.0,
        Math.random() * 5.0,
        Math.random() * 5.0,
      )
    }

    if (isWalking) {
      this.internalPed.gamePed.gotoCoord(
        pos,
        gamePed.pos.distanceTo(pos),
        heading,
      )
    }

    if (!gamePed.health && health > 0) gamePed.resurrect(health)
    gamePed.health = health
  }
}
