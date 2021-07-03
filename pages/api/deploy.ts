import { NextApiRequest, NextApiResponse } from 'next';
import { createRnodeService } from 'connectors/rnode-client';
import { NodeUrls, DeployArgs } from 'connectors/rnode-client/types';
import { RevAccount } from '@tgrospic/rnode-http-js';

export type DeployReqArgs = {
  node: string;
  code: string;
  account: string;
  phloLimit: string;
  setStatus: string;
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { method, query } = req;
  switch (method) {
    case 'GET': {
      const queryReq = query as DeployReqArgs;

      try {
        const pNode: NodeUrls = JSON.parse(queryReq.node);
        const pCode: string = JSON.parse(queryReq.code);
        const pAccount: RevAccount = JSON.parse(queryReq.code);
        const pPhloLimit: string = JSON.parse(queryReq.phloLimit);

        /*const objectMap = (obj, fn) =>
          Object.fromEntries(
            Object.entries(obj).map(([k, v], i) => [k, fn(v, k, i)])
          );

        objectMap(queryReq, (v) => JSON.parse(v));*/

        const { deploy } = createRnodeService(pNode);
        const result = await deploy({
          code: pCode,
          account: pAccount,
          phloLimit: pPhloLimit,
        });

        res.setHeader(
          'Cache-Control',
          'max-age=2678400, s-maxage=2678400 stale-while-revalidate'
        );
        res.status(200).send({ success: true, message: result });
      } catch (e) {
        console.log('fail');
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
    }
    case 'PUT':
      break;
    case 'PATCH':
      break;
  }
};

export default handler;
