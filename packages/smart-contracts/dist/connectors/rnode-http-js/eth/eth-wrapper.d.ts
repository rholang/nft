export declare const ethDetected: boolean;
/**
 * Request an address selected in Metamask
 * - the first request will ask the user for permission
 *
 * @returns Base 16 ETH address
 */
export declare const ethereumAddress: () => Promise<string>;
/**
 * Ethereum personal signature
 * https://github.com/ethereum/go-ethereum/wiki/Management-APIs#personal_sign
 *
 * @param bytes - Data to sign
 * @param ethAddr - Base 16 ETH address
 * @returns Base 16 signature
 */
export declare const ethereumSign: (bytes: Uint8Array | number[], ethAddr: string) => Promise<string>;
