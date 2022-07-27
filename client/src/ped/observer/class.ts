import * as alt from "alt-client"
import * as native from "natives"
import type { IXSyncPedSyncedMeta } from "xpeds-sync-shared"
import { Logger } from "xpeds-sync-shared"
import type { InternalPed, IPedController } from "../internal"

export class ObserverPed implements IPedController {
  private readonly player = alt.Player.local
  private readonly log: Logger

  private prevRagdoll = false
  private endRagdollTime: number | null = null
  private prevLocalRagdoll = false
  private startLocalRagdollTime: number | null = null
  private lastDamageTime = 0
  private lastSyncedHealth: number
  private prevVehicle: boolean
  private prevIsWalking = false

  private startLocalIsWalkingTime: number | null = null
  private prevLocalIsWalking = false
  private endIsWalkingTime: number | null = null

  constructor(private readonly internalPed: InternalPed) {
    this.log = new Logger(`observer: ${internalPed.xsyncPed.id}`)

    this.lastSyncedHealth = internalPed.xsyncPed.syncedMeta.health
    this.prevVehicle = !!internalPed.xsyncPed.syncedMeta.vehicle
  }

  private readonly posTick = alt.everyTick(
    this.posTickHandler.bind(this),
  )

  private readonly damageTick = alt.everyTick(
    this.damageTickHandler.bind(this),
  )

  private readonly metaTick = alt.everyTick(
    this.metaTickHandler.bind(this),
  )

  public destroy(): void {
    alt.clearEveryTick(this.posTick)
    alt.clearEveryTick(this.metaTick)
    alt.clearEveryTick(this.damageTick)
  }

  public onSyncedMetaChange(meta: Partial<IXSyncPedSyncedMeta>): void {
    this.prevVehicle = !!meta.vehicle
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
      let z = targetPos.z
      if (!syncedMeta.health) z += 1.0

      gamePed.pos = {
        ...targetPos,
        z,
      }
      return
    }

    if (!syncedMeta.health) return

    const multiplier = syncedMeta.isWalking ? 0.3 : 0.5
    let zMultipler = multiplier * 0.5

    if (!syncedMeta.ragdoll) zMultipler *= 0.01
    // this.log.log("setvelocity multiplier:", multiplier)

    const { pos } = gamePed

    gamePed.applyForce({
      x: (targetPos.x - pos.x) * multiplier,
      y: (targetPos.y - pos.y) * multiplier,
      z: (targetPos.z - pos.z) * zMultipler,
    })
  }

  private metaTickHandler(): void {
    const {
      pos,
      syncedMeta: {
        health,
        heading,
        vehicle,
        insideVehicle,
      },
    } = this.internalPed.xsyncPed

    if (!health) {
      this.internalPed.gamePed.health = 0
      return
    }

    let {
      ragdoll,
      isWalking,
    } = this.internalPed.xsyncPed.syncedMeta as { ragdoll: boolean | number; isWalking: boolean | number }
    ragdoll = !!ragdoll
    isWalking = !!isWalking

    const { gamePed } = this.internalPed
    const now = Date.now()

    gamePed.ragdoll = ragdoll

    const localRagdoll = gamePed.ragdoll
    const localIsWalking = gamePed.isWalking

    if (this.prevRagdoll !== ragdoll) {
      if (!ragdoll) this.endRagdollTime = now
      else this.endRagdollTime = null

      this.prevRagdoll = ragdoll
    }
    else if (this.endRagdollTime !== null && ((now - this.endRagdollTime) > 2000))
      this.endRagdollTime = null

    if (this.prevLocalRagdoll !== localRagdoll) {
      if (localRagdoll) this.startLocalRagdollTime = now
      else this.startLocalRagdollTime = null

      this.prevLocalRagdoll = localRagdoll
    }

    if (this.startLocalRagdollTime !== null &&
      !ragdoll && localRagdoll && !this.endRagdollTime &&
      ((now - this.startLocalRagdollTime) > 500)
    ) {
      this.startLocalRagdollTime = null
      gamePed.clearTasksImmediately()
    }

    // disable vehicle for now TODO: vehicle sync
    // if (isWalking && !vehicle) {

    if (this.prevIsWalking !== isWalking) {
      if (!isWalking) this.endIsWalkingTime = now
      else this.endIsWalkingTime = null

      this.prevIsWalking = isWalking
    }

    if (this.prevLocalIsWalking !== localIsWalking) {
      if (localIsWalking) this.startLocalIsWalkingTime = now
      else this.startLocalIsWalkingTime = null

      this.prevLocalIsWalking = localIsWalking
    }

    if (this.startLocalIsWalkingTime !== null &&
      !isWalking && localIsWalking && !this.endIsWalkingTime &&
      ((now - this.startLocalIsWalkingTime) > 500)
    ) {
      this.startLocalRagdollTime = null
      gamePed.clearTasksImmediately()
    }
    else if (isWalking) {
      const gamePos = gamePed.pos
      const speed = gamePos.distanceTo(pos) * 1.5

      this.internalPed.gamePed.gotoCoord(
        gamePos.add(new alt.Vector3(pos).sub(gamePos)),
        speed,
        heading,
      )
    }

    const nowGame = native.getGameTimer()

    if (nowGame - this.lastDamageTime > 500) {
      if (!gamePed.health && health > 0) gamePed.resurrect(health)
      gamePed.health = health
    }

    const [vehicleScriptId, seat, inside] = gamePed.vehicleIsTryingToEnter

    if (vehicle) {
      const [vehicleId, _seat] = vehicle
      const veh = alt.Vehicle.getByID(vehicleId)
      if (!veh)
        this.log.error(`meta.vehicle invalid (removed?) vehicle id: ${vehicleId}`)
      else {
        if (vehicleScriptId !== veh.scriptID || seat !== _seat) {
          this.log.log("task enter vehicle")
          gamePed.taskEnterVehicle(veh, seat)
        }
      }
    }
    else if (inside) gamePed.leaveVehicle()

    gamePed.heading = heading
  }

  private damageTickHandler(): void {
    const { currentWeapon } = this.player
    const damageTime = native.getTimeOfLastPedWeaponDamage(this.internalPed.gamePed.scriptID, currentWeapon)
    const isShooting = native.isPedShooting(this.player)

    // TODO: check if exactly local player damaged this ped

    if (this.lastDamageTime >= damageTime) return
    this.lastDamageTime = damageTime

    const { health: gameHealth } = this.internalPed.gamePed
    const damage = this.lastSyncedHealth - gameHealth

    this.log.log("ped damaged damage:", damage, "damageTime:", damageTime)
    if (damage <= 0) return

    this.lastSyncedHealth = this.internalPed.xsyncPed.syncedMeta.health
    // const nextHealth = this.  - damage

    const meta: Partial<IXSyncPedSyncedMeta> = {
      health: gameHealth,
    }

    // if (isShooting)
    //   meta.shoot = [this.player.id]

    this.internalPed.requestUpdateWatcherSyncedMeta(meta)
  }
}
