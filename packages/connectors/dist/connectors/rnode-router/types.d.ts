import { NodeUrls, RevAccount } from "connectors/rnode-http-js";
export declare type Router = {
    fn: string;
    client: string;
    params: RouterParams;
    node: NodeUrls;
};
export declare type RouterParams = {
    code: string;
    account?: RevAccount;
    phloLimit?: string;
};
export declare type ExploreDeployFX = {
    client: string;
    code: string;
};
export declare type DeployFX = {
    client: string;
    code: string;
    phloLimit: string;
};
