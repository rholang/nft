import * as fs from "fs";
import * as os from "os";

export const getEnvPath = () => {
  const dir = __dirname;
  const lastIndex = dir.lastIndexOf("\\");
  const workspacePath = dir.slice(0, lastIndex + 1);
  const envPath = `${workspacePath}\\.env`;

  return envPath;
};

export const writeEnv = (key: string, value: string) => {
  // read file from hdd & split if from a linebreak to a array
  const ENV_VARS = fs.readFileSync(getEnvPath(), "utf8").split(os.EOL);

  // find the env we want based on the key
  const target = ENV_VARS.indexOf(
    ENV_VARS.find((line) => line.match(new RegExp(key)))
  );

  // replace the key/value with the new value
  ENV_VARS.splice(target, 1, `${key}=${value}`);

  // write everything back to the file system
  fs.writeFileSync(getEnvPath(), ENV_VARS.join(os.EOL));
};
