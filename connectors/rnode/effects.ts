import { NodeUrls } from './types';
import { domain } from './model';

const exploreDeploy = async ({ node, code }) => {
  const formData = new FormData();
  formData.append('node', node);
  formData.append('code', code);

  try {
    const resultRaw = await fetch('/api/explore-deploy', {
      method: 'GET',
      body: formData,
    });
    const result = await resultRaw.json();
    if (result.success) {
      return result.message;
    }
  } catch (e) {
    throw new Error(e);
  }
};

const exploreDeployFx = domain.effect<{ node: NodeUrls; code: string }, string>(
  exploreDeploy
);

export const Effects = {
  exploreDeployFx,
};
