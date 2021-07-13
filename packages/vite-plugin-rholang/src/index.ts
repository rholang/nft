import path from "path";
import fs from "fs-extra";
import type { Plugin } from "vite";
import { normalizePath } from "vite";
import fg from "fast-glob";

export interface GenerationPattern {
    matchTokens: [string, string];
    path: string;
}

export interface Options {
    patterns: GenerationPattern[];
}

export type UserOptions = Partial<Options>;

const matchArgs = async (quotedCode: string) => {
    /* matchedArgs = all rho:arg1:entryUri */
    const matchedArgs = [...quotedCode.matchAll(/rho:arg(\d+:\w+)[`|\\"]/g)];

    if (matchedArgs) {
        /* mArgs = all position and name of args */
        const mArgs = matchedArgs
            .map((argEl) => {
                const position = argEl[0].match(/arg(\d+)/);
                const name = argEl[0].match(/arg\d+:(\w+)[`|\\"]/);

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
                /* replace all arguments of smart contract rho:arg1:entryUri -> ${entryUri} with template literal */
                return acc.replaceAll(`rho:arg${currVal.position}:${currVal.name}`, templLit);
            }, quotedCode);

            const argumentsCode = sortedmArgs.map((el) => el.name).flat();

            return { argumentsCode, argsReplacedCode };
        }
    }
    return { argumentsCode: "", argsReplacedCode: "" };
};

const transform = async (code: string, id: string) => {
    const fileName = path.basename(id).split(".", 1)[0];
    if (fileName) {
        const quotedCode = JSON.stringify(code);

        const { argumentsCode, argsReplacedCode } = await matchArgs(quotedCode);
        // console.log(argsReplacedCode);
        /*   match ` and replace with \`    */
        const backTicks = argsReplacedCode.replace(/\u0060/g, "\u005C\u0060");
        // const doubleQuotes = backTicks.replace(/\u005C\u0022/g, "\u0022");
        /*   match \\` and replace with \`  */
        const doubleBt = backTicks.replace(/\u005C\u005C\u0060/g, "\u005C\u0060");
        /*   match " on beginn and end and replace with `    */
        const doubleQuotesBeginn = doubleBt.replace(/^"/g, "\u0060");
        const doubleQuotesEnd = doubleQuotesBeginn.replace(/"$/g, "\u0060");
        // console.log(doubleQuotesEnd);
        const parsedCode = `export const ${fileName} = (${argumentsCode}) => ${doubleQuotesEnd}`;

        return parsedCode;
    }
    return ``;
};

const generatedExports = async (files: string[]) => {
    const exports = await Promise.all(
        files.map(async (file) => {
            const fileContent = await fs.readFile(file, "utf-8");
            const codeGen = await transform(fileContent, file);
            return codeGen;
        })
    );
    return exports;
};

export default (options: UserOptions = {}): Plugin => {
    let root: string;
    return {
        name: "vite:rholang",

        apply: "build",

        enforce: "pre",
        configResolved(_config) {
            root = _config.root;
        },
        async transform(code: string, id: string) {
            const fileRegex = /index\.ts$/;

            // Check if file is a vue file
            if (fileRegex.test(id)) {
                if (options.patterns) {
                    const matchTokens0 = options.patterns[0].matchTokens[0];
                    const matchTokens1 = options.patterns[0].matchTokens[1];
                    const { path: optionsPath } = options.patterns[0];
                    const regex = new RegExp(`${matchTokens0}[\\s\\S]*?${matchTokens1}`, "im");

                    /* load all files, which have rho extension */
                    const files = fg.sync(normalizePath(optionsPath), {
                        ignore: ["node_modules"],
                        onlyFiles: true,
                        cwd: root,
                        absolute: true
                    });

                    files.map((file) => {
                        this.addWatchFile(file);
                        return true;
                    });

                    const generatedExportsCode = await generatedExports(files);

                    if (regex.test(code)) {
                        const codeRes = code.replace(
                            regex,
                            `${matchTokens0}\n${generatedExportsCode}\n${matchTokens1}`
                        );
                        return {
                            code: codeRes,
                            map: null
                        };
                    }
                }
            }

            return {
                code,
                map: null
            };
        }
    };
};
