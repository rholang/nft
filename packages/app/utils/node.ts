import { Event as E } from "@rholang/connectors";

export const detectEnvironement = () => {
  const prodConfig = {
    selectedWallet: "testnetWallet",
    nets: "testnet",
  };

  const devConfig = {
    selectedWallet: "localWallet",
    nets: "localnet",
  };

  const getNodeEnv = () => {
    const nodeEnv =
      process.env.NODE_ENV === "production" ? prodConfig : devConfig;

    return nodeEnv;
  };
  const { selectedWallet, nets } = getNodeEnv();

  E.changeSelectedWallet(selectedWallet);
  E.changeNode(nets);
};
