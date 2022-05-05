import type { WSBoolean } from "altv-xsync-entity-shared"
export interface IXSyncPedSyncedMeta {
  model: number
  health: number
  ragdoll: WSBoolean
  isWalking: WSBoolean
  heading: number
}
