import { NodeUrls } from './types';
import { domain } from './model';

import { sendToApi } from '../../utils/browser-fetch';

const exploreDeploy = async ({ node, code }) => {
  const body = new FormData();
  body.append('node', node);
  body.append('code', code);

  try {
    console.log('run');

    const res = await sendToApi('GET', `/api/explore`, body);

    if (!res.success) {
      throw new Error((res.message as unknown) as string);
    }

    return res.message;
    /*const { data, error } = useSWR(
      'https://api.github.com/repos/vercel/swr',
      fetcher
    );*/

    /*const resultRaw = await fetch('/api/explore', {
      method: 'GET',
      body: formData,
    });
    const result = await resultRaw.json();
    if (result.success) {
      return result.message;
    }*/
  } catch (e) {
    console.log('fail');
    throw new Error(e);
  }
};

const exploreDeployFx = domain.effect<{ node: NodeUrls; code: string }, any>(
  exploreDeploy
);

export const Effects = {
  exploreDeployFx,
};
