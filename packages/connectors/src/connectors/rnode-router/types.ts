import { DeployArgs, ExploreDeployArgs, NodeUrls, RevAccount } from "connectors/rnode-http-js";

export type Router = {
    fn: string;
    client: string;
    params: RouterParams;
    node: NodeUrls;
};

export type RouterParams = { code: string; account?: RevAccount; phloLimit?: string };

export type ExploreDeployFX = { client: string; code: string };

export type DeployFX = { client: string; code: string; phloLimit: string };
