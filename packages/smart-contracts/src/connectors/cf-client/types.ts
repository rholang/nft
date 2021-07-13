import { NetworkName } from "connectors/rnode-http-js";

export type CfRequest = {
  net: NetworkName;
  code: string;
};
