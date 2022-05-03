import type * as alt from "alt-server"
import type { ClientEvent, IClientEvent } from "xpeds-sync-shared"
import { XPedsSync } from "../xpeds-sync"

export class Client {
  private readonly playerInfo: string

  constructor(
    private readonly player: Readonly<alt.Player>,
  ) {
    this.playerInfo = `${player.name} [${player.id}]`
  }

  public get info(): string {
    return `${this.playerInfo}${this.player.valid ? "" : " (disconnected)"}`
  }

  public get id(): number {
    return this.player.id
  }

  public get pos(): alt.IVector3 {
    return this.player.pos
  }

  public get pos2d(): alt.IVector2 {
    return {
      x: this.player.pos.x,
      y: this.player.pos.y,
    }
  }

  public get dimension(): number {
    return this.player.dimension
  }

  public send<K extends ClientEvent>(eventName: K, ...args: IClientEvent[K]): void {
    XPedsSync.instance.websocket.sendClient(this, eventName, args)
  }
}