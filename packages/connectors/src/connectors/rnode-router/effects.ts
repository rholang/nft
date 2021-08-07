import { Status, getNodeUrls, createRnodeService, getMetamaskAccount } from "connectors/rnode-http-js";
import { attach } from "effector";

import { cfExploreDeploy } from "connectors/cf-client";
import { Router, DeployFX, ExploreDeployFX } from "./types";

import { domain, Store as S } from "./model";

export const effectsRouter = async ({ fn, client, params, node }: Router): Promise<Status> => {
    const { exploreDeploy, deploy } = createRnodeService(node);
    const net = node.network;

    switch (client) {
        case "cf": {
            switch (fn) {
                case "exploreDeploy": {
                    const status = await cfExploreDeploy({ net, code: params.code });
                    return status;
                }
                default: {
                    const status = { success: "", message: "" };
                    return status;
                }
            }
        }

        case "rnode": {
            switch (fn) {
                case "exploreDeploy": {
                    const status = await exploreDeploy({ code: params.code });
                    return status;
                }

                case "deploy": {
                    if (params.account && params.phloLimit) {
                        const status = await deploy({
                            code: params.code,
                            account: params.account,
                            phloLimit: params.phloLimit
                        });
                        return status;
                    }
                    return { success: "", message: "" };
                }
                default: {
                    const status = { success: "", message: "" };
                    return status;
                }
            }
        }
        default: {
            const status = { success: "", message: "" };
            return status;
        }
    }
};

const routerFx = domain.effect<Router, Status, Error>(effectsRouter);

const addWalletFx = domain.effect(getMetamaskAccount);

const exploreDeployFx = attach({
    effect: routerFx,
    source: S.$rnodeStore,
    mapParams: (params: ExploreDeployFX, data) => {
        // console.log('Created effect called with', params, 'and data', data);
        const node = getNodeUrls(data.readNode);
        const paramsR = {
            code: params.code
        };
        return {
            fn: "exploreDeploy",
            client: params.client,
            params: paramsR,
            node
        };
    }
});

const deployFx = attach({
    effect: routerFx,
    source: S.$rnodeStore,
    mapParams: (params: DeployFX, data) => {
        // console.log('Created effect called with', params, 'and data', data);
        const node = getNodeUrls(data.valNode);
        const account = data.walletSelected;
        const paramsR = {
            code: params.code,
            account,
            phloLimit: params.phloLimit
        };
        return { fn: "deploy", client: params.client, params: paramsR, node };
    }
});

export const Effects = {
    deployFx,
    exploreDeployFx,
    addWalletFx
};
