import axios from 'axios';
export const nextjsExploreDeploy = async ({ node, code }) => {
  try {
    const formattedCode = code.replace(/(\r\n|\n|\r)/gm, '');

    const res = await axios.get('/api/explore', {
      params: {
        node: node,
        code: formattedCode,
      },
    });

    return res;
  } catch (e) {
    throw new Error(e);
  }
};
