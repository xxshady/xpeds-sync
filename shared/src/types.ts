import type { WSBoolean } from "altv-xsync-entity-shared"
export interface IXSyncPedSyncedMeta {
  model: number
  health: number
  ragdoll: WSBoolean
  isWalking: WSBoolean
  heading: number
  vehicle: [vehicleId: number, seat: number] | 0
  insideVehicle: WSBoolean
  // shotBy: [playerId: number]
}
