import axios from 'axios';
export const nextjsExploreDeploy = async ({ node, code }) => {
  try {
    const formattedCode = code.replace(/(\r\n|\n|\r)/gm, '');

    //formData.append('code', code);

    const res = await axios.get('/api/explore', {
      params: {
        node: node,
        code: formattedCode,
      },
    });

    // always executed
    /*const resultRaw = await fetch('/api/explore', {
      method: 'POST',
      body: JSON.stringify(formValues),
    });*/
    // const res = await sendToApi('POST', `/api/explore`, body);

    //const result = await resultRaw.json();
    return res;
  } catch (e) {
    throw new Error(e);
  }
};
