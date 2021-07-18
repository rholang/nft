import { RNodeEff, NodeUrls } from "./types";
import { RevAccount } from "./rev-address";
export declare const getMetamaskAccount: () => Promise<RevAccount>;
export declare const createRnodeService: (node: NodeUrls) => RNodeEff;
