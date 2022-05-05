// Generated by dts-bundle-generator v6.9.0

import * as alt from 'alt-server';
import * as xsync from 'altv-xsync-entity-server';
import { IXSyncPedSyncedMeta } from 'xpeds-sync-shared';

export declare type XSyncPedClass = {
	pool: xsync.EntityPool;
	new (pos: alt.IVector3, syncedMeta: IXSyncPedSyncedMeta): xsync.Entity<IXSyncPedSyncedMeta>;
};
export declare class XPedsSync {
	private static _instance;
	static get instance(): XPedsSync;
	private readonly log;
	readonly XSyncPed: XSyncPedClass;
	constructor(_xsync?: typeof xsync);
	private emitAltClient;
	private onEntityNetOwnerChange;
	private onPlayerConnect;
}
export declare class Ped {
	private static readonly pedsById;
	static getByID(id: number): Ped | null;
	private readonly xsyncInstance;
	private _valid;
	constructor(model: number, pos: alt.IVector3);
	get id(): number;
	get valid(): boolean;
	get netOwner(): alt.Player | null;
	get pos(): alt.Vector3;
	set pos(value: alt.IVector3);
	get health(): number;
	set health(value: number);
	destroy(): void;
}

export {};
