import { NextApiRequest, NextApiResponse } from 'next';
import { createRnodeService } from 'connectors/rnode-client';

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { method, body } = req;

  try {
    //const { node, code } = JSON.parse(body);

    /*const { exploreDeploy } = createRnodeService(node);
   const result = await exploreDeploy({
      code: code,
    });*/

    res.setHeader(
      'Cache-Control',
      'max-age=604800, s-maxage=604800 stale-while-revalidate'
    );
    res.status(200).send({ success: true, message: 'result' });
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
