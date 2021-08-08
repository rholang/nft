import { Store as S, Event as E, nets } from "./model";
import { Effects as Fx } from "./effects";

/* reducer store */
S.$rnodeStore
    .on(Fx.exploreDeployFx.doneData, (state, status) => ({ ...state, status }))
    .on(Fx.deployFx.doneData, (state, status) =>
        // console.log(status);
        ({ ...state, status })
    )
    .on(E.changeSelectedWallet, (state, newSelectedWallet) => {
        const filteredWallet = state.wallets.filter((item) => item.name === newSelectedWallet);
        if (filteredWallet) {
            return { ...state, walletSelected: filteredWallet[0] };
        }

        return state;
    })
    .on(E.changeNode, (state, newNode) => {
        const node = newNode === "localnet" ? nets[0] : nets[1];
        return { ...state, valNode: node.hosts[0], readNode: node.readOnlys[0] };
    })
    .on(Fx.addWalletFx.doneData, (state, revAccount) => {
        const { wallets } = state;
        const filteredWallets = wallets.filter((item) => item.name === "revWallet");

        if (filteredWallets.length === 0) {
            wallets.splice(
                wallets.length, // We want add at the END of our array
                0, // We do NOT want to remove any item
                { ...revAccount } // These are the items we want to add
            );
            const walletSelected = {
                name: revAccount.name,
                ethAddr: revAccount.ethAddr,
                revAddr: revAccount.revAddr
            };

            return { ...state, wallets, walletSelected };
        }
        return state;
    });

S.$walletStore.on(Fx.addWalletFx.doneData, () => ({ walletConnected: true }));
