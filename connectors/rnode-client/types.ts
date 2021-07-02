import {
  GetDeployDataEff,
  RNodeHttp,
  SendDeployEff,
} from '@tgrospic/rnode-http-js';
import { RevAccount } from '@tgrospic/rnode-http-js';
import { Store } from 'effector';

export type ConsoleEff = ConsoleLog & ConsoleWarn;
export type ConsoleWarn = { warn: typeof console.warn };
export type ConsoleLog = { log: typeof console.log };

export type PageLogArgs = { document: Document } & ConsoleLog;

export type DeployEff = { node: NodeUrls } & SendDeployEff &
  GetDeployDataEff &
  ConsoleLog;

export type DeployArgs = {
  readonly node: NodeUrls;
  readonly code: string;
  readonly account: RevAccount;
  readonly phloLimit: string;
  setStatus(msg: string): any;
};

export type ExploreDeployEff = {
  rnodeHttp: RNodeHttp;
  node: NodeUrls;
};
export type ExploreDeployArgs = { client?: string; code: string };

export type RNodeEff = {
  rnodeExploreDeploy(args: ExploreDeployArgs): Promise<[number, string]>;
  // rnodeDeploy(args: DeployArgs): Promise<string>;
};

export interface RNodeInfo {
  readonly domain: string;
  readonly grpc?: number;
  readonly http?: number;
  readonly https?: number;
  readonly httpAdmin?: number;
  readonly httpsAdmin?: number;
  // Network info
  readonly name?: NetworkName;
  readonly title?: string;
}

export interface RChainNetwork {
  readonly title: string;
  readonly name: NetworkName;
  readonly hosts: RNodeInfo[];
  readonly readOnlys: RNodeInfo[];
}

export type NetworkName = 'localnet' | 'testnet' | 'mainnet';

export interface NodeUrls {
  readonly network: NetworkName;
  readonly grpcUrl: string;
  readonly httpUrl: string;
  readonly httpAdminUrl: string;
  readonly statusUrl: string;
  readonly getBlocksUrl: string;
  // Testnet only
  readonly logsUrl: string;
  readonly filesUrl: string;
}
