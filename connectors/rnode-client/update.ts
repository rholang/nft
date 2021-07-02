import { Store as S, Event as E } from './model';
import { Effects as Fx } from './effects';
import { getNodeUrls } from './network';

S.$rnodeStore
  .on(E.exploreDeploy, (state, { client, code }) => {
    const node = getNodeUrls(state.readNode);

    Fx.exploreDeployFx({ client, node, code });
  })
  .on(Fx.exploreDeployFx.doneData, (state, result) => {
    console.log(result);
  });
