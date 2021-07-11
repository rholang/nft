import { access } from "fs-extra";
import path from "path";
import type { Plugin } from "vite";

export interface PluginOptions {
    tsConfigFilePath?: string;
    entryUri?: string;
}

const matchArgs = async (quotedCode: string) => {
    /* matchedArgs = all rho:arg1:entryUri */
    const matchedArgs = [...quotedCode.matchAll(/rho:arg(\d+:\w+)`/g)];
    if (matchedArgs) {
        /* mArgs = all position and name of args */
        const mArgs = matchedArgs
            .map((argEl) => {
                const position = argEl[0].match(/arg(\d+)/);
                const name = argEl[0].match(/arg\d+:(\w+)\u0060/);

                if (position && name) {
                    const p = position[1];
                    const n = name[1];
                    return { position: p, name: n };
                }
                return { position: "", name: "" };
            })
            .filter((value) => value.name !== "" || value.position !== "");

        if (mArgs) {
            const sortedmArgs = mArgs.sort((a, b) => (a.position > b.position ? 1 : -1));

            const argsReplacedCode = mArgs.reduce((acc, currVal) => {
                const templLit = `\${${currVal.name}}`;
                return acc.replaceAll(`rho:arg${currVal.position}:${currVal.name}`, templLit);
            }, quotedCode);

            const argumentsCode = sortedmArgs.map((el) => el.name).flat();
            console.log(argumentsCode);

            return { argumentsCode, argsReplacedCode };
        }
    }
    return { argumentsCode: "", argsReplacedCode: "" };
};

const transform = async (code: string, id: string) => {
    const fileName = path.basename(id).split(".", 1)[0];
    if (fileName) {
        const quotedCode = JSON.stringify(code);
        console.log(code);
        const { argumentsCode, argsReplacedCode } = await matchArgs(quotedCode);

        // const parsedCode = `export const test = (te) => \`\${te}\``;

        /* match ` and replace with \` */
        const backTicks = argsReplacedCode.replace(/\u0060/g, "\u005C\u0060");
        const doubleQuotes = backTicks.replace(/\u0022/g, "\u0060");
        const replacedBTCode = doubleQuotes.replace(/\u005C\u005C\u0060/g, "\u005C\u0060");
        console.log(replacedBTCode);
        const parsedCode = `export const ${fileName} = (${argumentsCode}) => ${replacedBTCode}`;
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
                console.log("final");
                console.log(parsedCode);
                return { code: parsedCode };
            }
            console.log("final");
            return code;
        }
    };
};
