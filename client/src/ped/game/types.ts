import type * as alt from "alt-client"

export interface IGamePedOptions {
  pos: alt.IVector3
  model: number
  health: number
}

export interface ISpawnListener {
  promise: Promise<void>
  resolve: () => void
  reject: () => void
}
