import { Status } from "connectors/rnode-http-js";
import { Router, DeployFX, ExploreDeployFX } from "./types";
export declare const effectsRouter: ({ fn, client, params, node }: Router) => Promise<Status>;
export declare const Effects: {
    deployFx: import("effector").Effect<DeployFX, unknown, Status>;
    exploreDeployFx: import("effector").Effect<ExploreDeployFX, unknown, Status>;
    addWalletFx: import("effector").Effect<void, import("../rnode-http-js").RevAccount, Error>;
};
