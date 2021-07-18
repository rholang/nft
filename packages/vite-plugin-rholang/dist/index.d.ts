import { Plugin } from 'vite';

interface GenerationPattern {
    matchTokens: [string, string];
    path: string;
}
interface Options {
    patterns: GenerationPattern[];
}
declare type UserOptions = Partial<Options>;
declare const _default: (options?: UserOptions) => Plugin;

export default _default;
export { GenerationPattern, Options, UserOptions };
