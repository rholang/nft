import { Store as S, Event as E } from './model';
import { Effects as Fx } from './effects';
import { getNodeUrls } from './network';

S.$rnodeStore
  .on(E.exploreDeploy, (state, { code }) => {
    const node = getNodeUrls(state.valNode);
    Fx.exploreDeployFx({ node, code });
  })
  .on(Fx.exploreDeployFx.doneData, (state, result) => {
    console.log(result);
  });
