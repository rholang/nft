// import { createEvent, createStore } from 'effector'

import { RevAccount, localNet, testNet, mainNet, RChainNetwork, RNodeInfo, Status } from "connectors/rnode-http-js";
import { createDomain } from "effector";

export const domain = createDomain();

export interface RNodeSt {
    /* all network urls */
    nets: RChainNetwork[];
    /* selected node for deploy */
    valNode: RNodeInfo;
    /* selected node for explore-deploy */
    readNode: RNodeInfo;
    /* all available wallets */
    wallets: RevAccount[];
    /* selected wallet */
    walletSelected: RevAccount;
    /* result data status */
    status: Status;
}

export interface Wallet {
    /* check if connected with browser wallet */
    walletConnected: boolean;
}

// action, typedefinitions state
const changeNode = domain.event<string>();
const addWallet = domain.event<void>();
const removeWallet = domain.event<RevAccount>();
const changeWallet = domain.event<RevAccount>();
const changeSelectedWallet = domain.event<string>();
const getNode = domain.event<void>();

// init store

export const nets = [localNet, testNet, mainNet].map(({ title, name, hosts, readOnlys }) => ({
    title,
    name,
    hosts: hosts.map((x) => ({ ...x, title, name })),
    readOnlys: readOnlys.map((x) => ({ ...x, title, name }))
}));

export const initNet = nets[0];

const initRnodeStore: RNodeSt = {
    nets,
    valNode: initNet.hosts[0],
    readNode: initNet.readOnlys[0],
    // Initial wallet
    wallets: [
        {
            name: "localWallet",
            revAddr: "11113y7AfYj7hShN49oAHHd3KiWxZRsodesdBi8QwSrPR5Veyh77S",
            privKey: "bb6f30056d1981b98e729cef72a82920e6242a4395e500bd24bd6c6e6a65c36c"
        },
        {
            name: "testnetWallet",
            revAddr: "111125rrPWgw5tGQWEHFW9ByFeLvHTkTSWFcvfsPVFxZnCgMZ4crL1",
            privKey: "4b25510e29397fe9097860cc17aba769f887e4da33b52c6fe58eb9c144a401c3"
        }
    ],
    walletSelected: {
        name: "localWallet",
        revAddr: "11113y7AfYj7hShN49oAHHd3KiWxZRsodesdBi8QwSrPR5Veyh77S",
        privKey: "bb6f30056d1981b98e729cef72a82920e6242a4395e500bd24bd6c6e6a65c36c"
    },
    status: { success: "", message: "" }
};

const initWalletStore: Wallet = { walletConnected: false };

// model
const $rnodeStore = domain.store<RNodeSt>(initRnodeStore);
const $walletStore = domain.store<Wallet>(initWalletStore);

export const Event = {
    changeNode,
    addWallet,
    removeWallet,
    changeWallet,
    changeSelectedWallet,
    getNode
};

export const Store = {
    $rnodeStore,
    $walletStore
};

//  register file  to worker
