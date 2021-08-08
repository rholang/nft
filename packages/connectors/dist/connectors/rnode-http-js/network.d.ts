import { RNodeInfo, RChainNetwork, NodeUrls } from "./types";
export declare const localNet: RChainNetwork;
export declare const testNet: RChainNetwork;
export declare const mainNet: RChainNetwork;
export declare const getNodeUrls: ({ name, domain, grpc, http, https, httpAdmin, httpsAdmin, instance }: RNodeInfo) => NodeUrls;
