import { Store as S, Event as E } from './model';
import { Effects as Fx, createRnodeService } from './effects';

S.$rnodeStore
  .on(E.deploy, (state, { code, account, phloLimit, setStatus }) => {
    const { deploy } = createRnodeService(state.valNode);
    Fx.request({ deploy, args: { code, account, phloLimit, setStatus } });
  })

  .on(E.exploreDeploy, (state, { code }) => {
    const { exploreDeploy } = createRnodeService(state.readNode);
    Fx.request({ exploreDeploy, args: { code } });
  })
  .on(Fx.request.doneData, (state, result) => {
    console.log(result);
  });
