import { Event as E } from "@rholang/sdk";

export const detectEnvironement = () => {
  const prodConfig = {
    selectedWallet: "testnetWallet",
    net: "testnet",
  };

  const devConfig = {
    selectedWallet: "localWallet",
    net: "localnet",
  };

  const getNodeEnv = () => {
    const nodeEnv =
      process.env.NODE_ENV === "production" ? prodConfig : devConfig;

    return nodeEnv;
  };

  const { selectedWallet, net } = getNodeEnv();

  E.changeSelectedWallet(selectedWallet);
  E.changeNode(net);
};
