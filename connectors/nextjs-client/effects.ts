export const nextjsExploreDeploy = async ({ node, code }) => {
  try {
    const formValues: any = {
      node: node,
      code: code,
    };
    //formData.append('code', code);

    const resultRaw = await fetch('/api/explore', {
      method: 'POST',
      body: JSON.stringify(formValues),
    });
    // const res = await sendToApi('POST', `/api/explore`, body);

    //const result = await resultRaw.json();
    console.log(resultRaw);
    return resultRaw;
  } catch (e) {
    throw new Error(e);
  }
};
