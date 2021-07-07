import axios, { AxiosResponse } from 'axios';
import { Status } from 'connectors/rnode-client';
export const cfExploreDeploy = async ({ node, code }): Promise<Status> => {
  try {
    const res = await axios.get('/explore', {
      params: {
        net: 'testnet',
        code: code,
      },
    });

    const responseData = res.data;

    return responseData;
  } catch (e) {
    throw new Error(e);
  }
};
