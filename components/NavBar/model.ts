//import { createEvent, createStore } from 'effector'
import { domain } from 'connectors/rnode-client';
import { Store as S } from 'connectors/rnode-client';
// action, typedefinitions state
const changeNameEvent = domain.event<void>();

// init store

// model
const $nameStore = domain.store<number>(3);

export const Event = {
  changeNameEvent,
};

export const Store = {
  $nameStore,
  $walletStore: S.$walletStore,
};

//register file  to worker
