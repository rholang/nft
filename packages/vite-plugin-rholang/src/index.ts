import { access } from "fs-extra";
import path from "path";
import type { Plugin } from "vite";

export interface PluginOptions {
    tsConfigFilePath?: string;
    entryUri?: string;
}

const matchArgs = async (quotedCode: string) => {
    /* matchedArgs = all rho:arg1:entryUri */
    const matchedArgs = quotedCode.match(/rho:arg(\d+:\w+)`/);
    if (matchedArgs) {
        /* mArgs = all position and name of args */
        const mArgs = matchedArgs
            .map((argEl) => {
                const position = argEl.match(/arg(\d+)/);
                const name = argEl.match(/arg\d+:(\w+)\u0060/);
                if (position && name) {
                    const p = position[1];
                    const n = name[1];
                    return { position: p, name: n };
                }
                return { position: "", name: "" };
            })
            .filter((value) => value.name !== "" || value.position !== "");
        if (mArgs) {
            const sortedArgs = mArgs.sort((a, b) => (a.position > b.position ? 1 : -1));
            console.log("sortedArgs");
            console.log(sortedArgs);
        }

        const argsReplacedCode = mArgs.reduce((acc, currVal) => {
            const templLit = `\${${currVal.name}}`;
            return acc.replaceAll(`rho:arg${currVal.position}:${currVal.name}`, templLit);
        }, quotedCode);
        console.log("argsReplacedCode");
        console.log(argsReplacedCode);

        const argumentsCode = mArgs.reduce((acc, curr) => {
            const sArgs = `${curr.name}:string,`;
            return acc + sArgs;
        }, "");
        console.log("argumentsCode");
        console.log(argumentsCode);
        return { argumentsCode, argsReplacedCode };
    }
    return { argumentsCode: "", argsReplacedCode: "" };
};

const transform = async (code: string, id: string) => {
    const fileName = path.basename(id).split(".", 1)[0];
    if (fileName) {
        const quotedCode = JSON.stringify(code);
        console.log(code);
        const { argumentsCode, argsReplacedCode } = await matchArgs(quotedCode);

        const parsedCode = `export const ${fileName} = 
            (${argumentsCode}) => ${argsReplacedCode}`;

        console.log(parsedCode);
        return JSON.stringify(parsedCode);
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
