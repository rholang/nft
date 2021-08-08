/**
 * Encode bytes to base 16 string.
 */
export declare const encodeBase16: (bytes: Uint8Array | number[]) => string;
/**
 * Decode base 16 string to bytes.
 */
export declare const decodeBase16: (hexStr: string) => Uint8Array;
/**
 * Encode base 16 string to base 58.
 */
export declare const encodeBase58: (hexStr: string) => any;
/**
 * Decode base 58 string (handle errors).
 */
export declare const decodeBase58safe: (str: string) => any;
/**
 * Decode ASCII string to bytes.
 */
export declare const decodeAscii: (str?: string) => number[];
