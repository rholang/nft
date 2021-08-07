// import { createEvent, createStore } from 'effector'
import { domain, Store as S } from "@rholang/connectors";

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

// register file  to worker
