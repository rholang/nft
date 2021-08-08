import { Status } from "connectors/rnode-http-js";
import { Router, DeployFX, ExploreDeployFX } from "./types";
export declare const effectsRouter: ({ fn, client, params, node }: Router) => Promise<Status>;
export declare const Effects: {
    deployFx: import("effector").Effect<DeployFX, Status, Error>;
    exploreDeployFx: import("effector").Effect<ExploreDeployFX, Status, Error>;
    addWalletFx: import("effector").Effect<void, import("connectors/rnode-http-js").RevAccount, Error>;
};
