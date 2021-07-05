import axios, { AxiosResponse } from 'axios';
import { Status } from 'connectors/rnode-client';
export const nextjsExploreDeploy = async ({ node, code }): Promise<Status> => {
  try {
    const formattedCode = code.replace(/(\r\n|\n|\r)/gm, '');

    const ab = async () => {
      await axios.get<void>(
        'https://www.coverstyl.com/de/selbstklebenden-folie/uni-farben/o6-solid-light-blue/160',
        {
          method: 'GET',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
        }
      );
    };
    ab();

    //console.log(ab.toString());

    const res = await axios.get<Status>('/api/explore', {
      params: {
        node: node,
        code: formattedCode,
      },
    });

    const responseData = res.data;

    return responseData;
  } catch (e) {
    throw new Error(e);
  }
};
