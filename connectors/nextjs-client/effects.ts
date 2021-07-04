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

export const nextjsDeploy = async ({
  node,
  code,
  account,
  phloLimit,
}): Promise<Status> => {
  try {
    const pCode = code.replace(/(\r\n|\n|\r)/gm, '');
    const pAccount = account.replace(/(\r\n|\n|\r)/gm, '');
    const pPhloLimit = phloLimit.replace(/(\r\n|\n|\r)/gm, '');

    const res = await axios.get<Status>('/api/deploy', {
      params: {
        node: node,
        code: pCode,
        pAccount: pAccount,
        pPhloLimit: pPhloLimit,
      },
    });

    const responseData = res.data;

    return responseData;
  } catch (e) {
    throw new Error(e);
  }
};
