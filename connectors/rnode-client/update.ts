import { Store as S, Event as E } from './model';
import { Effects as Fx } from './effects';
import { getNodeUrls } from './network';

/* reducer store */
S.$rnodeStore
  .on(Fx.exploreDeployFx.doneData, (state, status) => {
    return { ...state, status: status };
  })
  .on(Fx.deployFx.doneData, (state, status) => {
    console.log(status);
    return { ...state, status: status };
  })
  .on(Fx.addWalletFx.doneData, (state, revAccount) => {
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
