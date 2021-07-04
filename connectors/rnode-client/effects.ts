import { NodeUrls, Status, DeployDetailArgs } from './types';
import { domain, Store as S } from './model';
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
} from 'connectors/rnode-client/types';
import {
  ethereumAddress,
  createRevAccount,
  RevAddress,
} from 'connectors/rnode-http-js';
import * as R from 'ramda';
import { nextjsExploreDeploy, nextjsDeploy } from 'connectors/nextjs-client';

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
  async function ({ code, account, phloLimit }: DeployArgs): Promise<Status> {
    const { node, sendDeploy, getDataForDeploy } = effects;

    const phloLimitNum = R.isNil(phloLimit) ? phloLimit : parseInt(phloLimit);
    console.log(node);
    const { signature } = await sendDeploy(node, account, code, phloLimitNum);

    // Progress dots
    const mkProgress = (i: number) => () => {
      i = i > 60 ? 0 : i + 3;
      return `Checking result ${R.repeat('.', i).join('')}`;
    };
    const progressStep = mkProgress(0);
    const updateProgress = () => true;
    updateProgress();

    // Try to get result from next proposed block

    /*const getData = async () => {
      const { data, cost } = await getDataForDeploy(
        node,
        signature,
        updateProgress
      );
      return { data, cost };
    };

    const { data, cost } = await getData();

    // Extract data from response object
    const args = data ? rhoExprToJson(data.expr) : void 0;

    const costTxt = R.isNil(cost) ? 'failed to retrive' : cost;
    const [succ, message] = R.isNil(args)
      ? [
          false,
          'deploy found in the block but data is not sent on `rho:rchain:deployId` channel',
        ]
      : [true, R.is(Array, args) ? args.join(', ') : args];

    if (!succ) throw Error(`Deploy error: ${message}. // cost: ${costTxt}`);

    const success = succ.toString();*/
    const message = signature;
    return { success: '', message: message };
  };

export const getMetamaskAccount = async () => {
  console.log('meta');
  const ethAddr = await ethereumAddress();
  const revAccountAddress: RevAddress = createRevAccount(ethAddr);

  const revAccountName = { name: 'revWallet' };
  const revAccount = { ...revAccountAddress, ...revAccountName };
  console.log(revAccount);
  return revAccount;
};

export const createRnodeService = (node): RNodeEff => {
  const rnodeWeb = makeRNodeWeb({ now: Date.now });

  const { rnodeHttp, sendDeploy, getDataForDeploy } = rnodeWeb;

  // App actions to process communication with RNode
  return {
    exploreDeploy: exploreDeploy({ rnodeHttp, node }),
    deploy: deploy({ node, sendDeploy, getDataForDeploy }),
  };
};

export const effectsRouter = async ({ fn, params, node }) => {
  const { client, code, account, phloLimit } = params;

  const { exploreDeploy, deploy } = createRnodeService(node);

  switch (client) {
    case 'nextjs':
      {
        switch (fn) {
          case 'exploreDeploy': {
            const data = await nextjsExploreDeploy({ node, code });
            return data;
          }

          case 'deploy': {
            const data = await nextjsDeploy({ node, code, account, phloLimit });
            return data;
          }
        }
      }
      break;

    case 'rnode':
      {
        switch (fn) {
          case 'exploreDeploy': {
            const data = await exploreDeploy({ code });
            return data;
          }

          case 'deploy': {
            const data = await deploy({ code, account, phloLimit });
            return data;
          }
        }
      }
      break;
  }
};

const exploreDeployFxOrg = domain.effect<
  { fn: string; params: any; node: NodeUrls },
  Status
>(effectsRouter);

const deployFxOrg = domain.effect<
  {
    fn: string;
    params: DeployArgs;
    node: NodeUrls;
  },
  Status
>(effectsRouter);

const addWalletFx = domain.effect(getMetamaskAccount);

const exploreDeployFx = attach({
  effect: exploreDeployFxOrg,
  source: S.$rnodeStore,
  mapParams: (paramsR, data) => {
    //console.log('Created effect called with', params, 'and data', data);
    const node = getNodeUrls(data.readNode);
    return { fn: 'exploreDeploy', params: paramsR, node };
  },
});

const deployFx = attach({
  effect: deployFxOrg,
  source: S.$rnodeStore,
  mapParams: (params: DeployArgs, data) => {
    //console.log('Created effect called with', params, 'and data', data);
    const node = getNodeUrls(data.valNode);
    const account = data.walletSelected;
    const paramsR = {
      client: params.client,
      code: params.code,
      account: account,
      phloLimit: params.phloLimit,
    };
    return { fn: 'deploy', params: paramsR, node };
  },
});

export const Effects = {
  deployFx,
  exploreDeployFx,
  addWalletFx,
};
