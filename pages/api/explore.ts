import { NextApiRequest, NextApiResponse } from 'next';
import { createRnodeService } from 'connectors/rnode-client';
import { NodeUrls } from 'connectors/rnode-client/types';

export type Request = {
  node: string;
  code: string;
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { method, query } = req;
  switch (method) {
    case 'GET': {
      const { node, code } = query as Request;

      try {
        const formattedNode: NodeUrls = JSON.parse(node);
        const { exploreDeploy } = createRnodeService(formattedNode);
        const result = await exploreDeploy({
          code: code,
        });

        res.setHeader(
          'Cache-Control',
          'public, immutable, s-maxage=31536000, max-age=31536000, stale-while-revalidate=60'
        );
        res.status(200).send(result);
      } catch (e) {
        console.log('fail');
        res.setHeader(
          'Cache-Control',
          'public, immutable, s-maxage=31536000, max-age=31536000, stale-while-revalidate=60'
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
