import {
  makeRNodeWeb,
  DeployArgs,
  RNodeEff,
  Status,
  getNodeUrls,
  createRnodeService,
  getMetamaskAccount,
} from "connectors/rnode-http-js";
import { attach } from "effector";

import * as R from "ramda";
import { cfExploreDeploy } from "connectors/cf-client";
import { Router, DeployFX, ExploreDeployFX } from "./types";

import { domain, Store as S } from "./model";

export const effectsRouter = async ({ fn, client, params, node }: Router) => {
  const { code, account, phloLimit } = params;

  const { exploreDeploy, deploy } = createRnodeService(node);
  const net = node.network;

  switch (client) {
    case "cf": {
      switch (fn) {
        case "exploreDeploy": {
          const data = await cfExploreDeploy({ net, code });
          return data;
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
          const data = await exploreDeploy({ code });
          return data;
        }

        case "deploy": {
          const data = await deploy({ code, account, phloLimit });
          return data;
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

const exploreDeployFxOrg = domain.effect<any, Status>(effectsRouter);

const deployFxOrg = domain.effect<any, Status>(effectsRouter);

const addWalletFx = domain.effect(getMetamaskAccount);

const exploreDeployFx = attach({
  effect: exploreDeployFxOrg,
  source: S.$rnodeStore,
  mapParams: (params: ExploreDeployFX, data) => {
    // console.log('Created effect called with', params, 'and data', data);
    const node = getNodeUrls(data.readNode);
    const paramsR = {
      code: params.code,
      account: "",
      phloLimit: "",
    };
    return {
      fn: "exploreDeploy",
      client: params.client,
      params: paramsR,
      node,
    };
  },
});

const deployFx = attach({
  effect: deployFxOrg,
  source: S.$rnodeStore,
  mapParams: (params: DeployFX, data) => {
    // console.log('Created effect called with', params, 'and data', data);
    const node = getNodeUrls(data.valNode);
    const account = data.walletSelected;
    const paramsR = {
      code: params.code,
      account,
      phloLimit: params.phloLimit,
    };
    return { fn: "deploy", client: params.client, params: paramsR, node };
  },
});

export const Effects = {
  deployFx,
  exploreDeployFx,
  addWalletFx,
};
