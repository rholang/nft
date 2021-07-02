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

  const { node, code } = query as Request;

  try {
    const formattedNode: NodeUrls = JSON.parse(node);
    const { exploreDeploy } = createRnodeService(formattedNode);
    const result = await exploreDeploy({
      code: code,
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
};

export default handler;
