import * as fs from "fs";
import * as os from "os";
import { Status } from "@rholang/sdk";

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

export const writeUriEnv = (result: Status, envVar: string) => {
  if (result) {
    type MessageUri = { uri: string };
    const parsedUri: MessageUri = JSON.parse(JSON.stringify(result.message));
    const uri = parsedUri.uri
      ? [...parsedUri.uri.matchAll(/.*(rho:id.*)/g)]
      : null;

    if (uri) {
      writeEnv(envVar, uri[0][1].toString());
    }
  }
  console.log(result);
};

export const readKeyEnv = (key: string) => {
  // read file from hdd & split if from a linebreak to a array
  const ENV_VARS = fs.readFileSync(getEnvPath(), "utf8").split(os.EOL);

  // find the env we want based on the key
  const value = ENV_VARS.find((line) => line.match(new RegExp(key)));
  const rhoValue = value ? [...value.matchAll(/.*=(rho:id.*)/g)] : null;
  if (rhoValue) {
    return rhoValue[0][1].toString();
  }

  return "";
};
