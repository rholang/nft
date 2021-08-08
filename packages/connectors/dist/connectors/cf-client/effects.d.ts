import { Status } from "connectors/rnode-http-js";
import { CfRequest } from "./types";
export declare const cfExploreDeploy: ({ net, code }: CfRequest) => Promise<Status>;
