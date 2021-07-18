/**
 * Represents different formats of REV address
 */
export interface RevAddress {
    revAddr: string;
    ethAddr?: string;
    pubKey?: string;
    privKey?: string;
}
export interface RevAccount extends RevAddress {
    name: string;
}
/**
 * Get REV address from ETH address.
 */
export declare function getAddrFromEth(ethAddrRaw: string): string | undefined;
/**
 * Get REV address (with ETH address) from public key.
 */
export declare function getAddrFromPublicKey(publicKeyRaw: string): RevAddress | undefined;
/**
 * Get REV address (with ETH address and public key) from private key.
 */
export declare function getAddrFromPrivateKey(privateKeyRaw: string): RevAddress | undefined;
/**
 * Verify REV address
 */
export declare function verifyRevAddr(revAddr: string): boolean;
/**
 * Generates new private and public key, ETH and REV address.
 */
export declare function newRevAccount(): RevAddress;
/**
 * Creates REV address from different formats
 * (private key -> public key -> ETH address -> REV address)
 */
export declare function createRevAccount(text: string): RevAddress | undefined;
