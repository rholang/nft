import path from "path";
import type { Plugin } from "vite";

export interface PluginOptions {
    tsConfigFilePath?: string;
    entryUri?: string;
}

const transform = async (code: string, id: string) => {
    const fileName = path.basename(id).split(".", 1)[0];
    if (fileName) {
        const parsedCode = `export const ${fileName} = () => ${JSON.stringify(code)}`;
        return parsedCode;
    }
    return ``;
};

export default (options: PluginOptions = {}): Plugin => {
    const { tsConfigFilePath = "tsconfig.json", entryUri = "" } = options;

    return {
        name: "vite:rholang",

        apply: "build",

        enforce: "pre",

        async transform(code, id) {
            if (/\.rho?$/.test(id)) {
                const parsedCode = await transform(code, id);
                return { code: parsedCode, map: { mappings: "" } };
            }
            return code;
        }
    };
};
