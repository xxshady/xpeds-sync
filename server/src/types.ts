// import type * as xsync from "altv-xsync-entity-server"

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
}
