//import { createEvent, createStore } from 'effector'
import { domain } from 'connectors/rnode-client';

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
};

//register file  to worker
