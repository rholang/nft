import { RevAccount, RChainNetwork, RNodeInfo, Status } from "connectors/rnode-http-js";
export declare const domain: import("effector").Domain;
export interface RNodeSt {
    nets: RChainNetwork[];
    valNode: RNodeInfo;
    readNode: RNodeInfo;
    wallets: RevAccount[];
    walletSelected: RevAccount;
    status: Status;
}
export interface Wallet {
    walletConnected: boolean;
}
export declare const initNet: {
    title: string;
    name: import("../rnode-http-js").NetworkName;
    hosts: {
        title: string;
        name: import("../rnode-http-js").NetworkName;
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
        name: import("../rnode-http-js").NetworkName;
        domain: string;
        grpc?: number | undefined;
        http?: number | undefined;
        https?: number | undefined;
        httpAdmin?: number | undefined;
        httpsAdmin?: number | undefined;
        instance?: string | undefined;
    }[];
};
export declare const Event: {
    changeValNode: import("effector").Event<RNodeInfo>;
    changeReadNode: import("effector").Event<RNodeInfo>;
    addWallet: import("effector").Event<void>;
    removeWallet: import("effector").Event<RevAccount>;
    changeWallet: import("effector").Event<RevAccount>;
    changeSelectedWallet: import("effector").Event<RevAccount>;
    getNode: import("effector").Event<void>;
};
export declare const Store: {
    $rnodeStore: import("effector").Store<RNodeSt>;
    $walletStore: import("effector").Store<Wallet>;
};
