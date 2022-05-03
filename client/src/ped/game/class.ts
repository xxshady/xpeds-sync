import * as alt from "alt-client"
import * as native from "natives"
import { Logger } from "xpeds-sync-shared"
import type { XSyncPed } from "../../xsync-ped"
import type { IGamePedOptions } from "./types"

const log = new Logger("game-ped")

export class GamePed {
  private scriptID = 0

  constructor(
    ped: XSyncPed,
    options: IGamePedOptions,
  ) {
    const {
      model,
    } = options

    alt.Utils.requestModel(model)
      .then(() => {
        if (!ped.streamed) return
        this.createPed(options)
      })
      .catch(e => {
        log.error("failed to load model:", model, "of ped id:", ped.id)
        log.error(e)
      })
  }

  private createPed({
    model,
    pos,
    health,
  }: IGamePedOptions): void {
    const ped = native.createPed(2, model, pos.x, pos.y, pos.z, 0, false, false)

    native.setEntityHealth(ped, health, 0)

    native.setBlockingOfNonTemporaryEvents(ped, true)

    // disable writhe
    native.setPedConfigFlag(ped, 281, true)

    this.scriptID = ped
  }
}
