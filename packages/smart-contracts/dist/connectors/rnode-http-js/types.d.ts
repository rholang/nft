import { GetDeployDataEff, RNodeHttp, SendDeployEff, RevAccount, ProposeEff } from "@tgrospic/rnode-http-js";
export declare type ConsoleEff = ConsoleLog & ConsoleWarn;
export declare type ConsoleWarn = {
    warn: typeof console.warn;
};
export declare type ConsoleLog = {
    log: typeof console.log;
};
export declare type DeployEff = {
    node: NodeUrls;
} & SendDeployEff & GetDeployDataEff & AppProposeEff;
export declare type DeployArgs = {
    code: string;
    account: RevAccount;
    phloLimit: string;
};
export declare type ExploreDeployEff = {
    rnodeHttp: RNodeHttp;
    node: NodeUrls;
};
export declare type ExploreDeployArgs = {
    client?: string;
    code: string;
};
export declare type AppProposeEff = ProposeEff;
export declare type RNodeEff = {
    exploreDeploy(args: ExploreDeployArgs): Promise<Status>;
    deploy(args: DeployArgs): Promise<Status>;
};
export declare type Status = {
    success: string;
    message: string;
};
export interface RNodeInfo {
    readonly domain: string;
    readonly grpc?: number;
    readonly http?: number;
    readonly https?: number;
    readonly httpAdmin?: number;
    readonly httpsAdmin?: number;
    readonly instance?: string;
    readonly name?: NetworkName;
    readonly title?: string;
}
export interface RChainNetwork {
    readonly title: string;
    readonly name: NetworkName;
    readonly hosts: RNodeInfo[];
    readonly readOnlys: RNodeInfo[];
}
export declare type NetworkName = "localnet" | "testnet" | "mainnet";
export interface NodeUrls {
    readonly network: NetworkName;
    readonly grpcUrl: string;
    readonly httpUrl: string;
    readonly httpAdminUrl: string;
    readonly statusUrl: string;
    readonly getBlocksUrl: string;
    readonly logsUrl?: string;
    readonly filesUrl?: string;
}
