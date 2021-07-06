import axios, { AxiosResponse } from 'axios';
import { Status } from 'connectors/rnode-client';
export const cfExploreDeploy = async ({ node, code }): Promise<Status> => {
  try {
    const formattedCode = code.replace(/(\r\n|\n|\r)/gm, '');

    const data = {
      net: 'testnet',
      code: formattedCode,
    };

    const options = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const res = await axios.post<Status>('/explore', data, options);

    const responseData = res.data;

    return responseData;
  } catch (e) {
    throw new Error(e);
  }
};
