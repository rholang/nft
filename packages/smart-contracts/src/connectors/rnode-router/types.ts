import {
  DeployArgs,
  ExploreDeployArgs,
  NodeUrls,
} from "connectors/rnode-http-js";

export type Router = {
  fn: string;
  client: string;
  params: DeployArgs | ExploreDeployArgs;
  node: NodeUrls;
};

export type ExploreDeployFX = { client: string; code: string };

export type DeployFX = { client: string; code: string; phloLimit: string };
