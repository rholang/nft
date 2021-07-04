import { NodeUrls, Status } from './types';
import { domain, RNodeSt, Store as S } from './model';
import {
  makeRNodeWeb,
  rhoExprToJson,
  RevAccount,
} from 'connectors/rnode-http-js';
import { getNodeUrls } from './network';
import { attach } from 'effector';
import {
  ExploreDeployArgs,
  ExploreDeployEff,
  DeployArgs,
  DeployEff,
  RNodeEff,
  RNodeInfo,
} from 'connectors/rnode-client/types';
import {
  ethereumAddress,
  ethDetected,
  createRevAccount,
  RevAddress,
} from 'connectors/rnode-http-js';
import * as R from 'ramda';
import { nextjsExploreDeploy } from 'connectors/nextjs-client';

const exploreDeploy = ({ rnodeHttp, node }: ExploreDeployEff) =>
  async function ({ code }: ExploreDeployArgs): Promise<Status> {
    const {
      expr: [e],
    } = await rnodeHttp(node.httpUrl, 'explore-deploy', code);
    const dataBal = e as string;
    //console.log(dataBal);
    const dataError = (e && e.ExprString && e.ExprString.data) || '';
    return { success: dataError, message: dataBal };
  };

const deploy = (effects: DeployEff) =>
  async function ({ code, account, phloLimit }: DeployArgs) {
    const { node, sendDeploy, getDataForDeploy, log } = effects;

    log('SENDING DEPLOY', {
      account: account.name,
      phloLimit,
      node: node.httpUrl,
      code,
    });

    const phloLimitNum = R.isNil(phloLimit) ? phloLimit : parseInt(phloLimit);

    const { signature } = await sendDeploy(node, account, code, phloLimitNum);
    log('DEPLOY ID (signature)', signature);

    // Progress dots
    const mkProgress = (i: number) => () => {
      i = i > 60 ? 0 : i + 3;
      return `Checking result ${R.repeat('.', i).join('')}`;
    };
    const progressStep = mkProgress(0);
    const updateProgress = () => true;
    updateProgress();

    // Try to get result from next proposed block
    const { data, cost } = await getDataForDeploy(
      node,
      signature,
      updateProgress
    );
    // Extract data from response object
    const args = data ? rhoExprToJson(data.expr) : void 0;

    log('DEPLOY RETURN DATA', { args, cost, rawData: data });

    const costTxt = R.isNil(cost) ? 'failed to retrive' : cost;
    const [success, message] = R.isNil(args)
      ? [
          false,
          'deploy found in the block but data is not sent on `rho:rchain:deployId` channel',
        ]
      : [true, R.is(Array, args) ? args.join(', ') : args];

    if (!success) throw Error(`Deploy error: ${message}. // cost: ${costTxt}`);
    return `✓ (${message}) // cost: ${costTxt}`;
  };

export const getMetamaskAccount = async () => {
  const ethAddr = await ethereumAddress();
  const revAccountAddress: RevAddress = createRevAccount(ethAddr);

  const revAccountName = { name: 'revWallet' };
  const revAccount = { ...revAccountAddress, ...revAccountName };
  return revAccount;
};

export const createRnodeService = (node): RNodeEff => {
  const { log, warn } = console;
  const rnodeWeb = makeRNodeWeb({ now: Date.now });

  const { rnodeHttp, sendDeploy, getDataForDeploy } = rnodeWeb;

  // App actions to process communication with RNode
  return {
    exploreDeploy: exploreDeploy({ rnodeHttp, node }),
    deploy: deploy({ node, sendDeploy, getDataForDeploy, log }),
  };
};

export const effectsRouter = async ({ params, node }) => {
  const { client, code } = params;

  const { exploreDeploy, deploy } = createRnodeService(node);

  switch (client) {
    case 'nextjs': {
      const data = await nextjsExploreDeploy({ node, code });
      return data;
    }

    case 'rnode': {
      const data = await exploreDeploy({ code });

      return data;
    }
  }
};

const exploreDeployFxOrg = domain.effect<
  { params: any; node: NodeUrls },
  Status
>(effectsRouter);

const deployFxOrg = domain.effect<
  {
    params: any;
    node: NodeUrls;
  },
  any
>(effectsRouter);

const addWalletFx = domain.effect(getMetamaskAccount);

const exploreDeployFx = attach({
  effect: exploreDeployFxOrg,
  source: S.$rnodeStore,
  mapParams: (params, data) => {
    //console.log('Created effect called with', params, 'and data', data);
    const node = getNodeUrls(data.readNode);
    return { params, node };
  },
});

const deployFx = attach({
  effect: deployFxOrg,
  source: S.$rnodeStore,
  mapParams: (params, data) => {
    //console.log('Created effect called with', params, 'and data', data);
    const node = getNodeUrls(data.valNode);
    return { params, node };
  },
});

export const Effects = {
  deployFx,
  exploreDeployFx,
  addWalletFx,
};
