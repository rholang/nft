"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// src/index.ts
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _fsextra = require('fs-extra'); var _fsextra2 = _interopRequireDefault(_fsextra);
var _vite = require('vite');
var _fastglob = require('fast-glob'); var _fastglob2 = _interopRequireDefault(_fastglob);
var matchArgs = async (quotedCode) => {
  const matchedArgs = [...quotedCode.matchAll(/rho:arg:(\w+)[`|\\"]/g)];
  const nameArgsList = matchedArgs ? matchedArgs.map((el) => el[1]) : [];
  const remDuplArgs = nameArgsList.filter((value, index) => nameArgsList.indexOf(value) === index);
  if (remDuplArgs) {
    const argsReplacedCode = remDuplArgs.reduce((acc, currVal) => {
      const templLit = `\${${currVal}}`;
      return acc.replaceAll(`rho:arg:${currVal}`, templLit);
    }, quotedCode);
    const argumentsCode = remDuplArgs;
    return { argumentsCode, argsReplacedCode };
  }
  return { argumentsCode: "", argsReplacedCode: "" };
};
var transform = async (code, id) => {
  const fileName = _path2.default.basename(id).split(".", 1)[0];
  if (fileName) {
    const quotedCode = JSON.stringify(code);
    const { argumentsCode, argsReplacedCode } = await matchArgs(quotedCode);
    const backTicks = argsReplacedCode.replace(/\u0060/g, "\\`");
    const doubleBt = backTicks.replace(/\u005C\u005C\u0060/g, "\\`");
    const doubleQuotesBeginn = doubleBt.replace(/^"/g, "`");
    const doubleQuotesEnd = doubleQuotesBeginn.replace(/"$/g, "`");
    const parsedCode = `export const ${fileName} = ({${argumentsCode}}) => ${doubleQuotesEnd}`;
    return parsedCode;
  }
  return ``;
};
var generatedExports = async (files) => {
  const exports = await Promise.all(files.map(async (file) => {
    const fileContent = await _fsextra2.default.readFile(file, "utf-8");
    const codeGen = await transform(fileContent, file);
    return codeGen;
  }));
  return exports;
};
var src_default = (options = {}) => {
  let root;
  return {
    name: "vite:rholang",
    configResolved(_config) {
      root = _config.root;
    },
    async transform(code, id) {
      const fileRegex = /src\/index\.ts$/;
      if (fileRegex.test(id)) {
        if (options.patterns) {
          const matchTokens0 = options.patterns[0].matchTokens[0];
          const matchTokens1 = options.patterns[0].matchTokens[1];
          const { path: optionsPath } = options.patterns[0];
          const regex = new RegExp(`${matchTokens0}[\\s\\S]*?${matchTokens1}`, "im");
          const files = _fastglob2.default.sync(_vite.normalizePath.call(void 0, optionsPath), {
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
            const codeRes = code.replace(regex, `${matchTokens0}
${generatedExportsCode}
${matchTokens1}`);
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


exports.default = src_default;
