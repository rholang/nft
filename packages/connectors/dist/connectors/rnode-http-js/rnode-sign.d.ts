import { ec } from "elliptic";
/**
 * These deploy types are based on protobuf specification which must be
 * used to create the hash and signature of deploy data.
 * Deploy object sent to Web API is slightly different, see [rnode-web.ts](rnode-web.ts).
 */
/**
 * Deploy data (required for signing)
 */
export interface DeployData {
    readonly term: string;
    readonly timestamp: number;
    readonly phloPrice: number;
    readonly phloLimit: number;
    readonly validAfterBlockNumber: number;
}
/**
 * Signed DeployData object (protobuf specification)
 */
export interface DeploySignedProto {
    readonly term: string;
    readonly timestamp: number;
    readonly phloPrice: number;
    readonly phloLimit: number;
    readonly validAfterBlockNumber: number;
    readonly sigAlgorithm: string;
    readonly deployer: Uint8Array;
    readonly sig: Uint8Array;
}
/**
 * Sign deploy data.
 */
export declare const signDeploy: (privateKey: ec.KeyPair | string, deployObj: DeployData) => DeploySignedProto;
/**
 * Verify deploy signature.
 */
export declare const verifyDeploy: (deployObj: DeploySignedProto) => boolean;
/**
 * Serialization of DeployDataProto object without generated JS code.
 */
export declare const deployDataProtobufSerialize: (deployData: DeployData) => Uint8Array;
