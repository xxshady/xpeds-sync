// import type * as xsync from "altv-xsync-entity-server"

import type * as alt from "alt-server"
import type { Ped } from "./ped"

export interface IXPedsSyncOptions {
  // TODO: fix "Cannot find name 'xsync' in d.ts"
  xsync?: { Entity: unknown; EntityPool: unknown; XSyncEntity: unknown }
  /**
   * `false` by default, so the client will be initialized in the playerConnect event
   */
  customClientInit?: boolean
  /**
   * `50` by default (currently)
   */
  maxStreamedIn?: number
  /**
   * `200` by default
   */
  streamRange?: number

  /**
   * `100` by default
   */
  migrationRange?: number

  onPedDeath?: (ped: Ped, killer: alt.Player | null) => void

  onPedNetOwnerChange?: (ped: Ped, newNetOwner: alt.Player | null, oldNetOwner: alt.Player | null) => void

  onPedStreamIn?: (ped: Ped, toPlayer: alt.Player) => void
  onPedStreamOut?: (ped: Ped, fromPlayer: alt.Player) => void
}

export type PedNetOwnerChangeHandler = Required<IXPedsSyncOptions>["onPedNetOwnerChange"]

export type PedStreamInHandler = Required<IXPedsSyncOptions>["onPedStreamIn"]

export type PedStreamOutHandler = Required<IXPedsSyncOptions>["onPedStreamOut"]
