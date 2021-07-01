import { NextApiRequest, NextApiResponse } from 'next';
import proton from '../../services/proton-rpc';
import { makeRNodeWeb, rhoExprToJson } from 'connectors/rnode-http-js';
import {
  ExploreDeployArgs,
  ExploreDeployEff,
  DeployArgs,
  DeployEff,
  PageLogArgs,
  RNodeEff,
} from 'connectors/rnode-client/types';
import * as R from 'ramda';

const exploreDeploy = ({ rnodeHttp, node }: ExploreDeployEff) =>
  async function ({ code }: ExploreDeployArgs): Promise<[number, string]> {
    console.log('remote');
    const {
      expr: [e],
    } = await rnodeHttp(node.httpUrl, 'explore-deploy', code);
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

const resultDeploy = async (node, code) => {
  const { deploy } = createRnodeService(node);
  const result = await deploy(code);
  return result;
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { method, body } = req;
  switch (method) {
    case 'GET':
      try {
        const { node, code } = body;

        const result = await resultDeploy(node, code);

        res.setHeader(
          'Cache-Control',
          'max-age=604800, s-maxage=604800 stale-while-revalidate'
        );
        res.status(200).send({ success: true, message: result });
      } catch (e) {
        res.setHeader(
          'Cache-Control',
          'max-age=604800, s-maxage=604800 stale-while-revalidate'
        );
        res.status(500).send({
          success: false,
          message: e.message || 'Error retrieving profile avatars',
        });
      }
      break;

    case 'PUT':
      break;
    case 'PATCH':
      break;
  }
};

export default handler;
