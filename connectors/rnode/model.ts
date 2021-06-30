// import { createEvent, createStore } from 'effector'

import { RevAccount } from '@tgrospic/rnode-http-js';
import { localNet, testNet, mainNet, getNodeUrls } from './network';

import {
  RChainNetwork,
  RNodeInfo,
  DeployArgs,
  ExploreDeployArgs,
} from './types';

import { createDomain } from 'effector';
import './update';

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
}

// action, typedefinitions state
const changeValNode = domain.event<RNodeInfo>();
const changeReadNode = domain.event<RNodeInfo>();
const addWallet = domain.event<RevAccount[]>();
const removeWallet = domain.event<RevAccount>();
const changeWallet = domain.event<RevAccount>();
const changeWalletSelected = domain.event<RevAccount>();
const deploy = domain.event<DeployArgs>();
const exploreDeploy = domain.event<ExploreDeployArgs>();

// init store

const nets = [localNet, testNet, mainNet].map(
  ({ title, name, hosts, readOnlys }) => ({
    title,
    name,
    hosts: hosts.map((x) => ({ ...x, title, name })),
    readOnlys: readOnlys.map((x) => ({ ...x, title, name })),
  })
);

const initNet = nets[1];

const initRnodeStore: RNodeSt = {
  nets: nets,
  valNode: initNet.hosts[1],
  readNode: initNet.readOnlys[1],
  // Initial wallet
  wallets: [
    {
      revAddr: '1111yNahhR8CYJ7ijaJsyDU4zzZ1CrJgdLZtK4fve7zifpDK3crzZ',
      privKey:
        '9adef38fbc1cb97469ab54e0f362060cbd3f656a42319baf741b3ea64fcabb1d',
      name: 'test',
    },
  ],
  walletSelected: { name: '', revAddr: '' },
};

// model
const $rnodeStore = domain.store<RNodeSt>(initRnodeStore);

export const Event = {
  changeValNode,
  changeReadNode,
  addWallet,
  removeWallet,
  changeWallet,
  changeWalletSelected,
  deploy,
  exploreDeploy,
};

export const Store = {
  $rnodeStore,
};

// register file  to worker
