export enum AltClientEvents {
  Init = "xpedsSync:init",
}

export interface IAltClientEvent {
  [AltClientEvents.Init]: [pedPoolId: number]
}

export enum AltServerEvents {
  InitResponse = "xpedsSync:initResponse",
}

export interface IAltServerEvent {
  [AltServerEvents.InitResponse]: []
}
