import { defineConfig } from "vite";
import ts from "rollup-plugin-typescript2";
import rholang from "vite-plugin-rholang";
import { babel } from "@rollup/plugin-babel";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "nft",
    },
  },
  esbuild: false,
  plugins: [
    babel({
      include: ["./src/connectors/**"],
      extensions: [".ts"],
      babelHelpers: "bundled",
    }),
    {
      apply: "build",
      ...ts({
        tsconfig: "./tsconfig.json",
        check: false,
        useTsconfigDeclarationDir: true,
      }),
    },
  ],
});
