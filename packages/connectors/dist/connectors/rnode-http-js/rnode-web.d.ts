import { ec } from "elliptic";
import { DeployData, DeploySignedProto } from "./rnode-sign";
import { RevAccount } from "./rev-address";
export declare type RNodeHttp = (httpUrl: string, apiMethod: string, data?: any) => Promise<any>;
export declare type RNodeWebAPI = SendDeployEff & GetDeployDataEff & ProposeEff & RawRNodeHttpEff & GetSignedDeployEff;
export interface RawRNodeHttpEff {
    /**
     * Raw RNode HTTP interface.
     */
    readonly rnodeHttp: RNodeHttp;
}
export interface GetSignedDeployEff {
    /**
     * Creates signed deploy.
     */
    readonly getSignedDeploy: (node: {
        httpUrl: string;
    }, account: RevAccount, code: string, phloLimit?: number) => Promise<Deploy>;
}
export interface SendDeployEff {
    /**
     * Send deploy to RNode.
     */
    sendDeploy: (node: {
        httpUrl: string;
    }, account: RevAccount, code: string, phloLimit?: number) => Promise<Deploy>;
}
export interface GetDeployDataEff {
    /**
     * Get data from deploy (`rho:rchain:deployId`).
     */
    getDataForDeploy: (node: RNodeHttpUrl, deployId: string, onProgress: () => boolean) => Promise<{
        data: any;
        cost: number;
    }>;
}
export interface ProposeEff {
    /**
     * Tell the node to propose a block (admin/internal API only).
     */
    propose: (node: RNodeHttpAdminUrl) => Promise<string>;
}
/**
 * Deploy object with signature
 */
export interface Deploy {
    data: DeployData;
    sigAlgorithm: string;
    deployer: string;
    signature: string;
}
/**
 * Deploy info from block
 */
export interface DeployResult {
    sig: string;
    cost: number;
    errored: boolean;
    systemDeployError: string;
    deployer: string;
    sigAlgorithm: string;
    term: string;
    timestamp: number;
    phloPrice: number;
    phloLimit: number;
    validAfterBlockNumber: number;
}
/**
 * DOM effects used by RNode web client
 * - HTTP fetch for communication
 * - current time for deploy timestamp
 */
export interface DOMEffects {
    now: typeof Date.now;
}
/**
 * Create instance of RNode Web client.
 *
 * `const rnodeWeb = makeRNodeWeb({window.fetch, now: Date.now})`
 */
export declare function makeRNodeWeb(effects: DOMEffects): RNodeWebAPI;
declare type RNodeHttpUrl = {
    httpUrl: string;
};
declare type RNodeHttpAdminUrl = {
    httpAdminUrl: string;
};
/**
 * Creates deploy signature with Metamask.
 */
export declare const signMetamask: (deployData: DeployData) => Promise<Deploy>;
/**
 * Creates deploy signature with plain private key.
 */
export declare const signPrivKey: (deployData: DeployData, privateKey: ec.KeyPair | string) => Deploy;
/**
 * Converts JS object from protobuf spec. to Web API spec.
 */
export declare const toWebDeploy: (deployData: DeploySignedProto) => Deploy;
export {};
