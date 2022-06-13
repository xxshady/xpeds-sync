import type * as alt from "alt-client"
import type * as xsync from "altv-xsync-entity-client"
import type { Ped } from "../ped"

export interface IXPedsSyncOptions {
  nametags?: boolean
  xsync?: typeof xsync
  onPedStreamIn?: (ped: Ped) => void
  onPedStreamOut?: (ped: Ped) => void
  onPedNetOwnerChange?: (ped: Ped, netOwner: alt.Player | null) => void
}
