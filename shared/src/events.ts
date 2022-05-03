export enum AltClientEvents {
  Init = "xpedsSync:init",
}

export interface IAltClientEvent {
  [AltClientEvents.Init]: [pedPoolId: number]
}
