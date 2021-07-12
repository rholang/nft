import path, { parse, basename, relative, dirname } from "path";
import fs, { realpath } from "fs-extra";
import type { Plugin } from "vite";
// import { parse as _parse } from "@babel/parser";
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
        // console.log(code);
        const { argumentsCode, argsReplacedCode } = await matchArgs(quotedCode);

        // const parsedCode = `export const test = (te) => \`\${te}\``;

        /* match ` and replace with \` */
        const backTicks = argsReplacedCode.replace(/\u0060/g, "\u005C\u0060");
        const doubleQuotes = backTicks.replace(/\u0022/g, "\u0060");
        const replacedBTCode = doubleQuotes.replace(/\u005C\u005C\u0060/g, "\u005C\u0060");
        // console.log(replacedBTCode);
        const parsedCode = `export const ${fileName} = (${argumentsCode}) => ${replacedBTCode}`;
        return parsedCode;
    }
    return ``;
};

const generatedExports = async (files: string[]) => {
    const exports = await Promise.all(
        files.map(async (file) => {
            // const name = basename(file).split(".")[0];
            // const fullPath = path.join(name, file.base);
            // console.log(file);
            // const relativePath = relative(dirname(id), file);
            const fileContent = await fs.readFile(file, "utf-8");
            const codeGen = await transform(fileContent, file);
            return codeGen;
            // return `export { ${name} } from './${normalizePath(relativePath)}'`;
        })
    );
    return exports;
};

export default (options: UserOptions = {}): Plugin => {
    // const { tsConfigFilePath = "tsconfig.json", entryUri = "" } = options;
    let root: string;
    return {
        name: "vite:rholang",

        apply: "build",

        enforce: "pre",
        configResolved(_config) {
            root = _config.root;
        },
        /* async transform(code, id) {
            if (/\.rho?$/.test(id)) {
                const parsedCode = await transform(code, id);
                console.log("final");
                console.log(parsedCode);
                return { code: parsedCode };
            }
            console.log("final");
            return code;
        } */

        async transform(code: string, id: string) {
            const fileRegex = /index\.ts$/;

            // Check if file is a vue file
            if (fileRegex.test(id)) {
                if (options.patterns) {
                    const matchTokens0 = options.patterns[0].matchTokens[0];
                    const matchTokens1 = options.patterns[0].matchTokens[1];
                    const { path: optionsPath } = options.patterns[0];
                    const regex = new RegExp(`${matchTokens0}[\\s\\S]*?${matchTokens1}`, "im");

                    const files = fg.sync(normalizePath(optionsPath), {
                        ignore: ["node_modules"],
                        onlyFiles: true,
                        cwd: root,
                        absolute: true
                    });

                    const generatedExportsCode = await generatedExports(files);

                    if (regex.test(code)) {
                        // console.log(regex.test(code));
                        const codeRes = code.replace(
                            regex,
                            `${matchTokens0}\n${generatedExportsCode}\n${matchTokens1}`
                        );
                        console.log("generatedExports");
                        console.log(codeRes);
                        return {
                            code: codeRes,
                            map: null
                        };
                    }
                }
            }
            console.log("code");
            console.log(code);

            return {
                code,
                map: null
            };
        }
    };
};
