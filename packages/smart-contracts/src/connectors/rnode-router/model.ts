// import { createEvent, createStore } from 'effector'

import {
  RevAccount,
  localNet,
  testNet,
  mainNet,
  RChainNetwork,
  RNodeInfo,
  Status,
} from "connectors/rnode-http-js";
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
const changeValNode = domain.event<RNodeInfo>();
const changeReadNode = domain.event<RNodeInfo>();
const addWallet = domain.event<void>();
const removeWallet = domain.event<RevAccount>();
const changeWallet = domain.event<RevAccount>();
const changeSelectedWallet = domain.event<RevAccount>();
const getNode = domain.event<void>();

// init store

const nets = [localNet, testNet, mainNet].map(
  ({ title, name, hosts, readOnlys }) => ({
    title,
    name,
    hosts: hosts.map((x) => ({ ...x, title, name })),
    readOnlys: readOnlys.map((x) => ({ ...x, title, name })),
  })
);

export const initNet = nets[1];

const initRnodeStore: RNodeSt = {
  nets,
  valNode: initNet.hosts[0],
  readNode: initNet.readOnlys[0],
  // Initial wallet
  wallets: [
    {
      name: "test",
      revAddr: "1111yNahhR8CYJ7ijaJsyDU4zzZ1CrJgdLZtK4fve7zifpDK3crzZ",
      privKey:
        "9adef38fbc1cb97469ab54e0f362060cbd3f656a42319baf741b3ea64fcabb1d",
    },
  ],
  walletSelected: {
    name: "test",
    revAddr: "1111yNahhR8CYJ7ijaJsyDU4zzZ1CrJgdLZtK4fve7zifpDK3crzZ",
    privKey: "9adef38fbc1cb97469ab54e0f362060cbd3f656a42319baf741b3ea64fcabb1d",
  },
  status: { success: "", message: "" },
};

const initWalletStore: Wallet = { walletConnected: false };

// model
const $rnodeStore = domain.store<RNodeSt>(initRnodeStore);
const $walletStore = domain.store<Wallet>(initWalletStore);

export const Event = {
  changeValNode,
  changeReadNode,
  addWallet,
  removeWallet,
  changeWallet,
  changeSelectedWallet,
  getNode,
};

export const Store = {
  $rnodeStore,
  $walletStore,
};

//  register file  to worker
