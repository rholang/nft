import { Store as S, Event as E } from './model';
import { Effects as Fx, createRnodeService } from './effects';
import { getNodeUrls } from './network';

S.$rnodeStore
  .on(E.deploy, (state, { code, account, phloLimit, setStatus }) => {
    const { deploy } = createRnodeService(getNodeUrls(state.valNode));
    Fx.request({ func: deploy, args: { code, account, phloLimit, setStatus } });
  })

  .on(E.exploreDeploy, (state, { code }) => {
    const { exploreDeploy } = createRnodeService(getNodeUrls(state.readNode));
    Fx.request({ func: exploreDeploy, args: { code } });
  })
  .on(Fx.request.doneData, (state, result) => {
    console.log(result);
  });
