import { DeploySignedProto } from "../rnode-sign";
/**
 * Recover public key from Ethereum signed data and signature.
 *
 * @param data - Signed message bytes
 * @param sigHex - Signature base 16
 * @returns Public key base 16
 */
export declare const recoverPublicKeyEth: (data: Uint8Array | number[], sigHex: string) => string;
/**
 * Verify deploy signed with Ethereum compatible signature.
 */
export declare const verifyDeployEth: (deploySigned: DeploySignedProto) => boolean;
