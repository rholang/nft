import { NodeUrls } from './types';
import { domain } from './model';
import { NextApiRequest, NextApiResponse } from 'next';
import proton from '../../services/proton-rpc';
import {
  makeRNodeWeb,
  rhoExprToJson,
  RevAccount,
} from 'connectors/rnode-http-js';
import {
  ExploreDeployArgs,
  ExploreDeployEff,
  DeployArgs,
  DeployEff,
  PageLogArgs,
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
  async function ({ code }: ExploreDeployArgs): Promise<[number, string]> {
    const {
      expr: [e],
    } = await rnodeHttp(node.httpUrl, 'explore-deploy', code);
    const dataBal = e && e.ExprInt && e.ExprInt.data;
    const dataError = e && e.ExprString && e.ExprString.data;
    return [dataBal, dataError];
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

export const effectsRouter = async ({ client, node, code }) => {
  const { exploreDeploy, deploy } = createRnodeService(node);
  switch (client) {
    case 'nextjs': {
      const data = nextjsExploreDeploy({ node, code });
      return data;
    }

    case 'rnode': {
      const data = exploreDeploy({ code });
      return data;
    }
  }
};

const exploreDeployFx = domain.effect<
  { client: string; node: NodeUrls; code: string },
  any
>(effectsRouter);

const deployFx = domain.effect<
  {
    client: string;
    node: NodeUrls;
    code: string;
    account: RevAccount;
    phloLimit: string;
  },
  any
>(effectsRouter);

const getMetamaskAccountFx = domain.effect(getMetamaskAccount);

export const Effects = {
  deployFx,
  exploreDeployFx,
  getMetamaskAccountFx,
};
