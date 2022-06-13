import * as alt from "alt-client"
import * as native from "natives"
import type { IXSyncPedSyncedMeta } from "xpeds-sync-shared"
import { Logger } from "xpeds-sync-shared"
import type { InternalPed, IPedController } from "../internal"

export class ObserverPed implements IPedController {
  private readonly player = alt.Player.local
  private readonly log: Logger

  private prevRagdoll = false
  private startRagdollTime = 0
  private lastDamageTime = 0
  private lastSyncedHealth: number
  private prevVehicle: boolean

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
      gamePed.pos = targetPos
      return
    }

    // if (!syncedMeta.ragdoll) return
    if (!syncedMeta.health) return

    // TODO: fix wooden ragdoll

    const multiplier = syncedMeta.isWalking ? 2.6 : 4.0
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

    if (isWalking && !vehicle) {
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

    // gamePed.heading = heading
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
