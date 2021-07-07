import { Store as S, Event as E } from './model';

const test1234 = (value: any) => {
  return console.log(value);
};

const sleep = (ms: any) => {
  const now = Date.now();
  while (Date.now() < now + ms) {
    // noop
  }
};
//register to worker
S.$nameStore.on(E.changeNameEvent, (state, params) => {
  //sleep(500)
  return state + 1;
});
S.$nameStore.watch((value) => console.log(value));
