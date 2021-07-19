import { Event as E } from "@rholang/sdk";

export const detectEnvironement = () => {
  const prodConfig = {
    selectedWallet: "testnetWallet",
  };

  const devConfig = {
    selectedWallet: "localWallet",
  };

  const getNodeEnv = () => {
    console.log(process.env.NODE_ENV);
    const nodeEnv =
      process.env.NODE_ENV === "production" ? prodConfig : devConfig;
    return nodeEnv;
  };

  const { selectedWallet } = getNodeEnv();

  E.changeSelectedWallet(selectedWallet);
};
