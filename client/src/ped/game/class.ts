import * as alt from "alt-client"
import * as native from "natives"
import { Logger } from "xpeds-sync-shared"
import type { XSyncPed } from "../../xsync-ped"
import type { IPedController } from "../internal"
import type { IGamePedOptions, ISpawnListener } from "./types"

const log = new Logger("game-ped")

export class GamePed implements IPedController {
  private static readonly peds = new Set<GamePed>()

  static {
    alt.on(
      "resourceStop",
      () => GamePed.peds.forEach(p => p.destroy()),
    )
  }

  private _scriptID = 0
  private readonly options: IGamePedOptions

  private spawnListener: ISpawnListener | null

  constructor(
    xsyncPed: XSyncPed,
    options: IGamePedOptions,
  ) {
    const {
      model,
    } = options

    this.options = options

    let resolve = (): void => {}
    let reject = (): void => {}
    const promise = new Promise<void>((_resolve, _reject) => {
      resolve = _resolve
      reject = _reject
    })

    this.spawnListener = {
      promise,
      resolve,
      reject,
    }

    alt.Utils.requestModel(model, 3000)
      .then(() => {
        if (!xsyncPed.streamed) {
          this.spawnListener?.reject()
          return
        }
        this.spawnListener?.resolve()
        this.createPed()
        GamePed.peds.add(this)
      })
      .catch(e => {
        this.spawnListener?.reject()
        log.error("failed to load model:", model, "of ped id:", xsyncPed.id)
        log.error(e)
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
      x, y, z,
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
        this._scriptID, 1, 1, 0,
        false, false, false,
      )
    }
  }

  public get isWalking(): boolean {
    return native.isPedWalking(this._scriptID) || native.isPedRunning(this._scriptID)
  }

  public get heading(): number {
    return native.getEntityHeading(this._scriptID)
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

  public setVelocity({ x, y, z }: alt.IVector3): void {
    native.setEntityVelocity(this._scriptID, x, y, z)
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

    // native.resurrectPed(this._scriptID) // not working shit

    this.destroyInGame()
    this.createPed({
      model: this.options.model,
      health: health,
      pos: this.pos,
    })
  }

  private createPed({
    model,
    pos,
    health,
  }: IGamePedOptions = this.options): void {
    const ped = native.createPed(
      2,
      model,
      pos.x,
      pos.y,
      pos.z - 1.0, // game spawns ped +1 z axis difference to getEntityCoords
      0,
      false, false,
    )

    alt.nextTick(() => {
      this.health = health
    })

    native.setBlockingOfNonTemporaryEvents(ped, true)

    // disable writhe
    native.setPedConfigFlag(ped, 281, true)

    this._scriptID = ped
  }

  private destroyInGame(): void {
    native.deletePed(this._scriptID)
  }
}
