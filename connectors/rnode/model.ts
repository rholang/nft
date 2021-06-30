// import { createEvent, createStore } from 'effector'
import { domain } from 'utils/common';
import { RevAccount } from '@tgrospic/rnode-http-js';

import {
  RChainNetwork,
  RNodeInfo,
  DeployArgs,
  ExploreDeployArgs,
} from './types';

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

const initRnodeStore = {
  selRevAddr: '',
  code: '',
  phloLimit: ' ',
  status: '',
  dataError: '',
  proposeStatus: '',
  proposeError: '',
  samples: [],
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
