import { Store as S, Event as E } from './model';
import { exploreDeploy, deploy } from './effects';

S.$rnodeStore
  .on(E.deploy, (state, { account, code }) => {
    const { deploy } = createRnodeService(state.readNode);
    deploy(account, code);
    return [...state, wallet];
  })
  .on(E.exploreDeploy, (state, params) => {
    exploreDeploy({ rnodeHttp, getNode });
    return [...state, wallet];
  });
