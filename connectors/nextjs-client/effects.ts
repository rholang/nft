import axios, { AxiosResponse } from 'axios';
import { Status } from 'connectors/rnode-client';
export const nextjsExploreDeploy = async ({ node, code }): Promise<Status> => {
  try {
    const formattedCode = code.replace(/(\r\n|\n|\r)/gm, '');

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
