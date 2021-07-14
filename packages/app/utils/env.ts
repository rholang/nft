export const getEnvPath = () => {
  const dir = __dirname;
  const lastIndex = dir.lastIndexOf("\\");
  const workspacePath = dir.slice(0, lastIndex + 1);
  const envPath = `${workspacePath}\\.env`;

  return envPath;
};
