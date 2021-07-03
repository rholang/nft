import { Store as S, Event as E } from './model';
import { Effects as Fx } from './effects';
import { getNodeUrls } from './network';
import {
  ethereumAddress,
  ethDetected,
  createRevAccount,
  RevAddress,
} from 'connectors/rnode-http-js';

S.$rnodeStore
  .on(E.exploreDeploy, (state, { client, code }) => {
    const node = getNodeUrls(state.readNode);
    Fx.exploreDeployFx({ client, node, code });
  })
  .on(Fx.exploreDeployFx.doneData, (state, result) => {
    console.log(result);
  });
  .on(E.addWallet ,(state, revAccount )=> {

    return {...state, }
  }))


  const fillMetamaskAccountEv = async () => {
    const ethAddr = await ethereumAddress()
    const revAccount = createRevAccount(ethAddr) || {}
    E.addWallet(revAccount)
  }