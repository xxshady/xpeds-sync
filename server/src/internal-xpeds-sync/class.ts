import * as alt from "alt-server"
import * as xsync from "altv-xsync-entity-server"
import type { IAltClientEvent, IXSyncPedSyncedMeta } from "xpeds-sync-shared"
import { AltServerEvents, AltClientEvents, Logger } from "xpeds-sync-shared"

import { InitXSyncPed } from "../xsync-ped"
import type { XSyncPedClass } from "../xsync-ped"
import type { IXPedsSyncOptions } from "../types"
import type { IPendingPlayerInit } from "./types"

export class InternalXPedsSync {
  private static _instance: InternalXPedsSync | null = null

  public static get instance(): InternalXPedsSync {
    if (!InternalXPedsSync._instance)
      throw new Error("xpeds sync is not initialized")

    return InternalXPedsSync._instance
  }

  public readonly XSyncPed: XSyncPedClass

  private readonly log = new Logger("main")
  private readonly customClientInit: boolean
  private readonly _xsync: xsync.XSyncEntity
  private readonly pendingPlayerInits = new Map<alt.Player, IPendingPlayerInit>()

  public readonly pedDeathHandler: Required<IXPedsSyncOptions>["onPedDeath"]

  constructor({
    xsync: _xsync,
    customClientInit,
    maxStreamedIn,
    streamRange,
    onPedDeath,
    onPedNetOwnerChange,
    onPedStreamIn,
    onPedStreamOut,
  }: Required<IXPedsSyncOptions>,
  ) {
    if (InternalXPedsSync._instance) throw new Error("xpeds sync already initialized")
    InternalXPedsSync._instance = this

    this.customClientInit = customClientInit

    // TODO: fix "Cannot find name 'xsync' in d.ts"
    this._xsync = new (_xsync as typeof xsync).XSyncEntity({
      customClientInit,
      wss: {
        // TODO: add user api for ws
        localhost: true,
      },
      netOwnerLogic: {
        // entityNetOwnerChange: this.onEntityNetOwnerChange.bind(this),
        requestUpdateEntitySyncedMeta: this.onRequestUpdateEntitySyncedMeta.bind(this),
      },
    })

    this.XSyncPed = InitXSyncPed(
      xsync,
      maxStreamedIn,
      streamRange,
      onPedNetOwnerChange,
      onPedStreamIn,
      onPedStreamOut,
    )
    this.pedDeathHandler = onPedDeath

    if (!customClientInit)
      alt.on("playerConnect", this.initClientInternal.bind(this))

    alt.on("playerDisconnect", this.onPlayerDisconnect.bind(this))
    alt.onClient(AltServerEvents.InitResponse, this.onClientInitResponse.bind(this))
  }

  public initClient(player: alt.Player): void {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.initClientInternal(player)
      .catch(e => {
        this.log.error(`initClient player: ${player.name} [${player.id}] failed, error: ${e}`)
      })
      .then(() => {
        this._xsync.initClient(player)
      })
  }

  private emitAltClient <K extends AltClientEvents>(player: alt.Player, eventName: K, ...args: IAltClientEvent[K]): void {
    player.emitRaw(eventName, ...args)
  }

  // private onEntityNetOwnerChange(
  //   entity: xsync.Entity,
  //   netOwner: alt.Player | null,
  //   oldNetOwner: alt.Player | null,
  // ): void {
  //   if (!(entity instanceof this.XSyncPed)) return

  //   // this.log.log("onEntityNetOwnerChange", entity.id, oldNetOwner?.name, "->", netOwner?.name)
  // }

  private onRequestUpdateEntitySyncedMeta(
    entity: xsync.Entity,
    watcher: alt.Player,
    changedMeta: Readonly<Partial<IXSyncPedSyncedMeta>>,
  ): boolean {
    if (!(entity instanceof this.XSyncPed)) return false

    this.log.log("onRequestUpdateEntitySyncedMeta", Object.keys(changedMeta))
    return true
  }

  private onPlayerDisconnect(player: alt.Player): void {
    this.log.log("onPlayerDisconnect")
    this.pendingPlayerInits.delete(player)
  }

  private onClientInitResponse(player: alt.Player): void {
    this.log.log(`onClientInitResponse player: ${player.name} ${player.id}`)

    const pending = this.pendingPlayerInits.get(player)
    if (!pending)
      throw new Error(`received invalid init response player: ${player.name} [${player.id}]`)

    this.pendingPlayerInits.delete(player)
    pending.resolve()
  }

  private initClientInternal(player: alt.Player): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.pendingPlayerInits.has(player))
        throw new Error("client init already pending")

      this.pendingPlayerInits.set(player, {
        resolve,
        reject: () => {
          reject(new Error("client disconnected or something went wrong"))
        },
      })
      this.emitAltClient(player, AltClientEvents.Init, this.XSyncPed.pool.id)
    })
  }
}
