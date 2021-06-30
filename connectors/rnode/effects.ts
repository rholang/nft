import * as R from 'ramda';

import {
  ExploreDeployArgs,
  ExploreDeployEff,
  DeployArgs,
  DeployEff,
} from './types';
import { rhoExprToJson } from '@tgrospic/rnode-http-js';
import { domain } from 'utils/common';
import { PageLogArgs, RNodeEff } from './types';
import { makeRNodeWeb } from '@tgrospic/rnode-http-js';

const exploreDeploy = ({ rnodeHttp, node }: ExploreDeployEff) =>
  async function ({
    deployCode,
  }: ExploreDeployArgs): Promise<[number, string]> {
    const { readNode } = node();

    const {
      expr: [e],
    } = await rnodeHttp(node, 'explore-deploy', deployCode);
    const dataBal = e && e.ExprInt && e.ExprInt.data;
    const dataError = e && e.ExprString && e.ExprString.data;
    return [dataBal, dataError];
  };

const deploy = (effects: DeployEff) =>
  async function ({ code, account, phloLimit, setStatus }: DeployArgs) {
    const { node, sendDeploy, getDataForDeploy, log } = effects;

    log('SENDING DEPLOY', {
      account: account.name,
      phloLimit,
      node: node.httpUrl,
      code,
    });

    setStatus(`Deploying ...`);

    const phloLimitNum = R.isNil(phloLimit) ? phloLimit : parseInt(phloLimit);

    const { signature } = await sendDeploy(node, account, code, phloLimitNum);
    log('DEPLOY ID (signature)', signature);

    // Progress dots
    const mkProgress = (i: number) => () => {
      i = i > 60 ? 0 : i + 3;
      return `Checking result ${R.repeat('.', i).join('')}`;
    };
    const progressStep = mkProgress(0);
    const updateProgress = () => setStatus(progressStep());
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

export const pageLog = ({ log, document }: PageLogArgs) => {
  // Page logger
  const logEL = document.querySelector('#log');
  const logWrap = (...args: any[]) => {
    const lines = Array.from(args).map((x) => {
      const f = (_: any, v: any) =>
        v && v.buffer instanceof ArrayBuffer ? Array.from(v).toString() : v;
      return JSON.stringify(x, f, 2).replace(/\\n/g, '<br/>');
    });
    const el = document.createElement('pre');
    el.innerHTML = lines.join(' ');
    logEL?.prepend(el);
    log(...args);
  };
  return logWrap;
};

export const createRnodeService = (node): RNodeEff => {
  const { fetch, document } = window;
  const { log, warn } = console;
  const rnodeWeb = makeRNodeWeb({ fetch, now: Date.now });

  const { rnodeHttp, sendDeploy, getDataForDeploy } = rnodeWeb;

  // App actions to process communication with RNode
  return {
    exploreDeploy: exploreDeploy({ rnodeHttp, node }),
    deploy: deploy({ node, sendDeploy, getDataForDeploy, log }),
  };
};

const sendDeployFx = (code) => {
  const { deploy } = createRnodeService(node);
  deploy(code);
};

const sendExploreDeployFx = (code) => {
  const { exploreDeploy } = createRnodeService(node);
  exploreDeploy(code);
};

const sendDeployFX = domain.effect(sendDeployFx);

const sendExploreDeployFX = domain.effect(sendExploreDeployFx);

export const Effects = {
  sendExploreDeployFX,
  sendDeployFX,
};
