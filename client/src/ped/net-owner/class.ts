import * as alt from "alt-client"
import type { ILogger } from "altv-xlogger"
import type { WSBoolean } from "altv-xsync-entity-shared"
import type { IXSyncPedSyncedMeta } from "xpeds-sync-shared"
import { Logger } from "xpeds-sync-shared"
import type { InternalPed, IPedController } from "../internal"
import type { IVehicle } from "./types"

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

  private readonly log: ILogger

  private prevHealth: number
  private prevHeading: number
  private prevRagdoll: boolean
  private prevIsWalking: boolean
  private prevPos: alt.IVector3 = alt.Vector3.zero
  private prevVehicle: IVehicle = {
    scriptID: 0,
    seat: 0,
    inside: false,
  }

  constructor(
    private readonly internalPed: InternalPed,
  ) {
    this.log = new Logger(`observer: ${internalPed.xsyncPed.id}`)

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
      vehicleIsTryingToEnter,
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

    const [vehicleScriptId, seat, insideVehicle] = vehicleIsTryingToEnter

    if (
      this.prevVehicle.scriptID !== vehicleScriptId &&
      this.prevVehicle.seat !== seat
    ) {
      if (vehicleScriptId) {
        const vehicle = alt.Vehicle.getByScriptID(vehicleScriptId)
        if (!vehicle)
          this.log.error(`ped trying to enter unknown vehicle script id: ${vehicleScriptId}`)
        else {
          updatedMeta.vehicle = [vehicle.id, seat]
          this.prevVehicle = {
            scriptID: vehicleScriptId,
            seat,
            inside: insideVehicle,
          }
        }
      }
      else {
        updatedMeta.vehicle = 0
        updatedMeta.insideVehicle = 0
        this.prevVehicle = { scriptID: 0, seat: 0, inside: false }
      }
    }
    if (this.prevVehicle.inside !== insideVehicle) {
      updatedMeta.insideVehicle = +insideVehicle as WSBoolean
      this.prevVehicle.inside = insideVehicle
    }

    if (Object.keys(updatedMeta).length > 0)
      this.internalPed.sendNetOwnerSyncedMetaUpdate(updatedMeta)
  }
}
