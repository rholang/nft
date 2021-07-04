import { Store as S, Event as E } from './model';
import { Effects as Fx } from './effects';
import { getNodeUrls } from './network';

S.$rnodeStore
  .on(E.exploreDeploy, (state, { client, code }) => {
    const node = getNodeUrls(state.readNode);
    Fx.exploreDeployFx({ client, node, code });
  })
  .on(Fx.exploreDeployFx.doneData, (state, status) => {
    //console.log(state);
    return { ...state, status: status };
  })
  .on(E.deploy, (state, { client, code, phloLimit }) => {
    const node = getNodeUrls(state.readNode);
    Fx.deployFx({
      client,
      node,
      code,
      account: state.walletSelected,
      phloLimit,
    });
  })
  .on(Fx.deployFx.doneData, (_, result) => {
    //console.log(result);
  })
  .on(E.addWallet, () => {
    Fx.getMetamaskAccountFx();
  })
  .on(Fx.getMetamaskAccountFx.doneData, (state, revAccount) => {
    const { wallets } = state;
    const filteredWallets = wallets.filter((item) => {
      return item.name == 'revWallet';
    });

    if (filteredWallets.length == 0) {
      wallets.splice(
        wallets.length, // We want add at the END of our array
        0, // We do NOT want to remove any item
        { ...revAccount } // These are the items we want to add
      );
      const walletSelected = {
        name: revAccount.name,
        revAddr: revAccount.revAddr,
      };
      return { ...state, wallets, walletSelected };
    }
  });
