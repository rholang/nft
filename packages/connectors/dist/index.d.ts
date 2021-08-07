import * as connectors_rnode_http_js from 'connectors/rnode-http-js';
import { NetworkName as NetworkName$1, Status as Status$1, RChainNetwork as RChainNetwork$1, RNodeInfo as RNodeInfo$1, RevAccount as RevAccount$1, NodeUrls as NodeUrls$1 } from 'connectors/rnode-http-js';
import * as effector from 'effector';
import { ec } from 'elliptic';
import { SendDeployEff as SendDeployEff$1, GetDeployDataEff as GetDeployDataEff$1, RevAccount as RevAccount$2, RNodeHttp as RNodeHttp$1, ProposeEff as ProposeEff$1 } from '@tgrospic/rnode-http-js';

declare type CfRequest = {
    net: NetworkName$1;
    code: string;
};

declare const cfExploreDeploy: ({ net, code }: CfRequest) => Promise<Status$1>;

declare const domain: effector.Domain;
interface RNodeSt {
    nets: RChainNetwork$1[];
    valNode: RNodeInfo$1;
    readNode: RNodeInfo$1;
    wallets: RevAccount$1[];
    walletSelected: RevAccount$1;
    status: Status$1;
}
interface Wallet {
    walletConnected: boolean;
}
declare const nets: {
    title: string;
    name: connectors_rnode_http_js.NetworkName;
    hosts: {
        title: string;
        name: connectors_rnode_http_js.NetworkName;
        domain: string;
        grpc?: number | undefined;
        http?: number | undefined;
        https?: number | undefined;
        httpAdmin?: number | undefined;
        httpsAdmin?: number | undefined;
        instance?: string | undefined;
    }[];
    readOnlys: {
        title: string;
        name: connectors_rnode_http_js.NetworkName;
        domain: string;
        grpc?: number | undefined;
        http?: number | undefined;
        https?: number | undefined;
        httpAdmin?: number | undefined;
        httpsAdmin?: number | undefined;
        instance?: string | undefined;
    }[];
}[];
declare const initNet: {
    title: string;
    name: connectors_rnode_http_js.NetworkName;
    hosts: {
        title: string;
        name: connectors_rnode_http_js.NetworkName;
        domain: string;
        grpc?: number | undefined;
        http?: number | undefined;
        https?: number | undefined;
        httpAdmin?: number | undefined;
        httpsAdmin?: number | undefined;
        instance?: string | undefined;
    }[];
    readOnlys: {
        title: string;
        name: connectors_rnode_http_js.NetworkName;
        domain: string;
        grpc?: number | undefined;
        http?: number | undefined;
        https?: number | undefined;
        httpAdmin?: number | undefined;
        httpsAdmin?: number | undefined;
        instance?: string | undefined;
    }[];
};
declare const Event: {
    changeNode: effector.Event<string>;
    addWallet: effector.Event<void>;
    removeWallet: effector.Event<RevAccount$1>;
    changeWallet: effector.Event<RevAccount$1>;
    changeSelectedWallet: effector.Event<string>;
    getNode: effector.Event<void>;
};
declare const Store: {
    $rnodeStore: effector.Store<RNodeSt>;
    $walletStore: effector.Store<Wallet>;
};

declare type Router = {
    fn: string;
    client: string;
    params: RouterParams;
    node: NodeUrls$1;
};
declare type RouterParams = {
    code: string;
    account?: RevAccount$1;
    phloLimit?: string;
};
declare type ExploreDeployFX = {
    client: string;
    code: string;
};
declare type DeployFX = {
    client: string;
    code: string;
    phloLimit: string;
};

declare const effectsRouter: ({ fn, client, params, node }: Router) => Promise<Status$1>;
declare const Effects: {
    deployFx: effector.Effect<DeployFX, Status$1, Error>;
    exploreDeployFx: effector.Effect<ExploreDeployFX, Status$1, Error>;
    addWalletFx: effector.Effect<void, connectors_rnode_http_js.RevAccount, Error>;
};

/**
 * These deploy types are based on protobuf specification which must be
 * used to create the hash and signature of deploy data.
 * Deploy object sent to Web API is slightly different, see [rnode-web.ts](rnode-web.ts).
 */
/**
 * Deploy data (required for signing)
 */
interface DeployData {
    readonly term: string;
    readonly timestamp: number;
    readonly phloPrice: number;
    readonly phloLimit: number;
    readonly validAfterBlockNumber: number;
}
/**
 * Signed DeployData object (protobuf specification)
 */
interface DeploySignedProto {
    readonly term: string;
    readonly timestamp: number;
    readonly phloPrice: number;
    readonly phloLimit: number;
    readonly validAfterBlockNumber: number;
    readonly sigAlgorithm: string;
    readonly deployer: Uint8Array;
    readonly sig: Uint8Array;
}
/**
 * Sign deploy data.
 */
declare const signDeploy: (privateKey: ec.KeyPair | string, deployObj: DeployData) => DeploySignedProto;
/**
 * Verify deploy signature.
 */
declare const verifyDeploy: (deployObj: DeploySignedProto) => boolean;
/**
 * Serialization of DeployDataProto object without generated JS code.
 */
declare const deployDataProtobufSerialize: (deployData: DeployData) => Uint8Array;

/**
 * Represents different formats of REV address
 */
interface RevAddress {
    revAddr: string;
    ethAddr?: string;
    pubKey?: string;
    privKey?: string;
}
interface RevAccount extends RevAddress {
    name: string;
}
/**
 * Get REV address from ETH address.
 */
declare function getAddrFromEth(ethAddrRaw: string): string | undefined;
/**
 * Get REV address (with ETH address) from public key.
 */
declare function getAddrFromPublicKey(publicKeyRaw: string): RevAddress | undefined;
/**
 * Get REV address (with ETH address and public key) from private key.
 */
declare function getAddrFromPrivateKey(privateKeyRaw: string): RevAddress | undefined;
/**
 * Verify REV address
 */
declare function verifyRevAddr(revAddr: string): boolean;
/**
 * Generates new private and public key, ETH and REV address.
 */
declare function newRevAccount(): RevAddress;
/**
 * Creates REV address from different formats
 * (private key -> public key -> ETH address -> REV address)
 */
declare function createRevAccount(text: string): RevAddress | undefined;

declare type RNodeHttp = (httpUrl: string, apiMethod: string, data?: any) => Promise<any>;
declare type RNodeWebAPI = SendDeployEff & GetDeployDataEff & ProposeEff & RawRNodeHttpEff & GetSignedDeployEff;
interface RawRNodeHttpEff {
    /**
     * Raw RNode HTTP interface.
     */
    readonly rnodeHttp: RNodeHttp;
}
interface GetSignedDeployEff {
    /**
     * Creates signed deploy.
     */
    readonly getSignedDeploy: (node: {
        httpUrl: string;
    }, account: RevAccount, code: string, phloLimit?: number) => Promise<Deploy>;
}
interface SendDeployEff {
    /**
     * Send deploy to RNode.
     */
    sendDeploy: (node: {
        httpUrl: string;
    }, account: RevAccount, code: string, phloLimit?: number) => Promise<Deploy>;
}
interface GetDeployDataEff {
    /**
     * Get data from deploy (`rho:rchain:deployId`).
     */
    getDataForDeploy: (node: RNodeHttpUrl, deployId: string, onProgress: () => boolean) => Promise<{
        data: any;
        cost: number;
    }>;
}
interface ProposeEff {
    /**
     * Tell the node to propose a block (admin/internal API only).
     */
    propose: (node: RNodeHttpAdminUrl) => Promise<string>;
}
/**
 * Deploy object with signature
 */
interface Deploy {
    data: DeployData;
    sigAlgorithm: string;
    deployer: string;
    signature: string;
}
/**
 * Deploy info from block
 */
interface DeployResult {
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
interface DOMEffects {
    now: typeof Date.now;
}
/**
 * Create instance of RNode Web client.
 *
 * `const rnodeWeb = makeRNodeWeb({window.fetch, now: Date.now})`
 */
declare function makeRNodeWeb(effects: DOMEffects): RNodeWebAPI;
declare type RNodeHttpUrl = {
    httpUrl: string;
};
declare type RNodeHttpAdminUrl = {
    httpAdminUrl: string;
};
/**
 * Creates deploy signature with Metamask.
 */
declare const signMetamask: (deployData: DeployData) => Promise<Deploy>;
/**
 * Creates deploy signature with plain private key.
 */
declare const signPrivKey: (deployData: DeployData, privateKey: ec.KeyPair | string) => Deploy;
/**
 * Converts JS object from protobuf spec. to Web API spec.
 */
declare const toWebDeploy: (deployData: DeploySignedProto) => Deploy;

/**
 * Recover public key from Ethereum signed data and signature.
 *
 * @param data - Signed message bytes
 * @param sigHex - Signature base 16
 * @returns Public key base 16
 */
declare const recoverPublicKeyEth: (data: Uint8Array | number[], sigHex: string) => string;
/**
 * Verify deploy signed with Ethereum compatible signature.
 */
declare const verifyDeployEth: (deploySigned: DeploySignedProto) => boolean;

declare const ethDetected: boolean;
/**
 * Request an address selected in Metamask
 * - the first request will ask the user for permission
 *
 * @returns Base 16 ETH address
 */
declare const ethereumAddress: () => Promise<string>;
/**
 * Ethereum personal signature
 * https://github.com/ethereum/go-ethereum/wiki/Management-APIs#personal_sign
 *
 * @param bytes - Data to sign
 * @param ethAddr - Base 16 ETH address
 * @returns Base 16 signature
 */
declare const ethereumSign: (bytes: Uint8Array | number[], ethAddr: string) => Promise<string>;

/**
 * Encode bytes to base 16 string.
 */
declare const encodeBase16: (bytes: Uint8Array | number[]) => string;
/**
 * Decode base 16 string to bytes.
 */
declare const decodeBase16: (hexStr: string) => Uint8Array;
/**
 * Encode base 16 string to base 58.
 */
declare const encodeBase58: (hexStr: string) => any;
/**
 * Decode base 58 string (handle errors).
 */
declare const decodeBase58safe: (str: string) => any;
/**
 * Decode ASCII string to bytes.
 */
declare const decodeAscii: (str?: string) => number[];

declare const rhoExprToJson: (input: any) => any;

declare type ConsoleEff = ConsoleLog & ConsoleWarn;
declare type ConsoleWarn = {
    warn: typeof console.warn;
};
declare type ConsoleLog = {
    log: typeof console.log;
};
declare type DeployEff = {
    node: NodeUrls;
} & SendDeployEff$1 & GetDeployDataEff$1 & AppProposeEff;
declare type DeployArgs = {
    code: string;
    account: RevAccount$2;
    phloLimit: string;
};
declare type ExploreDeployEff = {
    rnodeHttp: RNodeHttp$1;
    node: NodeUrls;
};
declare type ExploreDeployArgs = {
    client?: string;
    code: string;
};
declare type AppProposeEff = ProposeEff$1;
declare type RNodeEff = {
    exploreDeploy(args: ExploreDeployArgs): Promise<Status>;
    deploy(args: DeployArgs): Promise<Status>;
};
declare type Status = {
    success: string;
    message: string;
};
interface RNodeInfo {
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
interface RChainNetwork {
    readonly title: string;
    readonly name: NetworkName;
    readonly hosts: RNodeInfo[];
    readonly readOnlys: RNodeInfo[];
}
declare type NetworkName = "localnet" | "testnet" | "mainnet";
interface NodeUrls {
    readonly network: NetworkName;
    readonly grpcUrl: string;
    readonly httpUrl: string;
    readonly httpAdminUrl: string;
    readonly statusUrl: string;
    readonly getBlocksUrl: string;
    readonly logsUrl?: string;
    readonly filesUrl?: string;
}

declare const getMetamaskAccount: () => Promise<RevAccount>;
declare const createRnodeService: (node: NodeUrls) => RNodeEff;

declare const localNet: RChainNetwork;
declare const testNet: RChainNetwork;
declare const mainNet: RChainNetwork;
declare const getNodeUrls: ({ name, domain, grpc, http, https, httpAdmin, httpsAdmin, instance }: RNodeInfo) => NodeUrls;

export { AppProposeEff, ConsoleEff, ConsoleLog, ConsoleWarn, DOMEffects, Deploy, DeployArgs, DeployData, DeployEff, DeployResult, DeploySignedProto, Effects, Event, ExploreDeployArgs, ExploreDeployEff, GetDeployDataEff, GetSignedDeployEff, NetworkName, NodeUrls, ProposeEff, RChainNetwork, RNodeEff, RNodeHttp, RNodeInfo, RNodeSt, RNodeWebAPI, RawRNodeHttpEff, RevAccount, RevAddress, SendDeployEff, Status, Store, Wallet, cfExploreDeploy, createRevAccount, createRnodeService, decodeAscii, decodeBase16, decodeBase58safe, deployDataProtobufSerialize, domain, effectsRouter, encodeBase16, encodeBase58, ethDetected, ethereumAddress, ethereumSign, getAddrFromEth, getAddrFromPrivateKey, getAddrFromPublicKey, getMetamaskAccount, getNodeUrls, initNet, localNet, mainNet, makeRNodeWeb, nets, newRevAccount, recoverPublicKeyEth, rhoExprToJson, signDeploy, signMetamask, signPrivKey, testNet, toWebDeploy, verifyDeploy, verifyDeployEth, verifyRevAddr };
