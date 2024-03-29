import * as alt from "alt-client"
import * as native from "natives"
import { Logger } from "xpeds-sync-shared"
import type { XSyncPed } from "../../xsync-ped"
import type { IPedController } from "../internal"
import { PedNotStreamedError } from "./errors"
import type { ISpawnListener } from "./types"

const log = new Logger("game-ped")

export class GamePed implements IPedController {
  private static readonly PED_TYPE = 0
  private static readonly peds = new Set<GamePed>()

  static {
    alt.on(
      "resourceStop",
      () => GamePed.peds.forEach(p => p.destroy()),
    )
  }

  private _scriptID = 0

  private spawnListener: ISpawnListener | null

  constructor(private readonly xsyncPed: XSyncPed) {
    const {
      model,
    } = xsyncPed.syncedMeta

    let resolve = (): void => {}
    let reject = (error: Error): void => {}
    const promise = new Promise<void>((_resolve, _reject) => {
      resolve = _resolve
      reject = _reject
    })

    this.spawnListener = {
      promise,
      resolve,
      reject,
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    alt.Utils.requestModel(model, 10000)
      .catch(e => {
        this.spawnListener?.reject(e)
        log.error("failed to load model:", model, "of ped id:", xsyncPed.id)
        log.error(e)
      })
      .then(() => {
        if (!xsyncPed.streamed) {
          this.spawnListener?.reject(new PedNotStreamedError("ped is not streamed anymore"))
          return
        }
        this.spawnListener?.resolve()
        this.createPed()
        GamePed.peds.add(this)
      })
  }

  public get scriptID(): number {
    return this._scriptID
  }

  public get pos(): alt.Vector3 {
    return native.getEntityCoords(this._scriptID, false)
  }

  public set pos({ x, y, z }: alt.IVector3) {
    native.setEntityCoords(
      this._scriptID,
      x, y, z - 1.0,
      false, false, false, false,
    )
  }

  public get health(): number {
    return native.getEntityHealth(this._scriptID)
  }

  public set health(value: number) {
    native.setEntityHealth(this._scriptID, value, 0)
  }

  public get ragdoll(): boolean {
    return native.isPedRagdoll(this._scriptID)
  }

  public set ragdoll(value: boolean) {
    if (value) {
      native.setPedToRagdoll(
        this._scriptID, 0, 0, 0,
        true, true, false,
      )
    }
  }

  public get isWalking(): boolean {
    const vel = native.getEntityVelocity(this._scriptID)

    // log.log("(vel.x + vel.y):", (Math.abs(vel.x) + Math.abs(vel.y)).toFixed(2))

    return (
      Math.abs(vel.x) + Math.abs(vel.y) > 1.5 &&
      !this.ragdoll
    )
  }

  public get heading(): number {
    return native.getEntityHeading(this._scriptID)
  }

  public set heading(value: number) {
    native.setPedDesiredHeading(this._scriptID, value)
  }

  public get vehicleIsTryingToEnter(): [vehicle: number, seat: number, inside: boolean] {
    const vehScriptID = native.getVehiclePedIsTryingToEnter(this._scriptID)

    return [
      vehScriptID,
      native.getSeatPedIsTryingToEnter(this._scriptID),
      native.isPedInVehicle(this._scriptID, vehScriptID, false),
    ]
  }

  public async waitForSpawn(): Promise<void> {
    if (this._scriptID) return
    await this.spawnListener?.promise
    this.spawnListener = null
  }

  public destroy(): void {
    if (!this._scriptID) return

    this.destroyInGame()
    GamePed.peds.delete(this)

    this._scriptID = 0
  }

  public applyForce({ x, y, z }: alt.IVector3): void {
    native.applyForceToEntity(
      this._scriptID,
      1,
      x, y, z,
      0, 0, 0,
      0,
      false, true, true, true, true,
    )
  }

  public gotoCoord({ x, y, z }: alt.IVector3, speed: number, heading: number): void {
    // TEST walking style
    native.taskGoStraightToCoord(
      this._scriptID,
      x, y, z,
      speed,
      -1, heading, 0,
    )
  }

  public resurrect(health: number): void {
    if (!this._scriptID) return

    const prevPed = this._scriptID
    this.createPed(health, this.pos)
    this.destroyInGame(prevPed)
  }

  public clearTasks(): void {
    native.clearPedTasks(this._scriptID)
  }

  public clearTasksImmediately(): void {
    native.clearPedTasksImmediately(this._scriptID)
  }

  public taskEnterVehicle(vehicle: alt.Vehicle, seat: number): void {
    native.taskEnterVehicle(
      this._scriptID,
      vehicle,
      -1,
      seat,
      3.0, // TEST
      1,
      null as unknown as string,
    )
  }

  // public setIntoVehicle(vehicle: alt.Vehicle, seat: number): void {
  //   native.setPedIntoVehicle(this._scriptID, vehicle, seat)
  // }

  public leaveVehicle(): void {
    native.taskLeaveAnyVehicle(this._scriptID, 0, 1)
  }

  private createPed(_health?: number, _pos?: alt.IVector3): void {
    let {
      pos,
      syncedMeta: {
        // eslint-disable-next-line prefer-const
        model, insideVehicle, vehicle, health,
      },
    } = this.xsyncPed

    health = _health ?? health
    pos = _pos ?? pos

    let ped: number

    const createPed = (): number => native.createPed(
      GamePed.PED_TYPE,
      model,
      pos.x,
      pos.y,
      pos.z - 1.0, // game spawns ped +1 z axis difference to getEntityCoords
      0,
      false, false,
    )

    if (insideVehicle) {
      if (!vehicle) {
        log.error("synced meta .insideVehicleis true but no .vehicle")
        ped = createPed()
      }
      else {
        const [vehicleId, seat] = vehicle
        const veh = alt.Vehicle.getByID(vehicleId)
        if (!veh) {
          log.error(`cant get vehicle id: ${vehicleId} for ped id: ${this.xsyncPed.id}`)
          ped = createPed()
        }
        else
          ped = native.createPedInsideVehicle(veh, GamePed.PED_TYPE, model, seat, false, false)
      }
    }
    else
      ped = createPed()

    alt.nextTick(() => {
      this.health = health
    })

    native.setBlockingOfNonTemporaryEvents(ped, true)

    // disable writhe
    native.setPedConfigFlag(ped, 281, true)

    // red dot crosshair
    native.setPedAsEnemy(ped, true)

    // same clothes / appearance on all clients
    native.setPedDefaultComponentVariation(ped)

    // improve ped pathing/routing
    native.setPedPathClimbCostModifier(ped, 0)
    native.setCanClimbOnEntity(ped, true)
    native.setPedCanCowerInCover(ped, true)
    native.setPedPathCanDropFromHeight(ped, true)
    native.setPedPathCanUseLadders(ped, true)
    native.setPedPathCanUseClimbovers(ped, true)

    this._scriptID = ped
  }

  private destroyInGame(ped = this._scriptID): void {
    native.deletePed(ped)
  }
}
