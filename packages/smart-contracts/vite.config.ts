import { defineConfig } from "vite";
import ts from "rollup-plugin-typescript2";
import rholang from "@rholang/vite-plugin-rholang";
import { babel } from "@rollup/plugin-babel";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",

      name: "@rholang/sdk",

      fileName: "index",
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["react", "@types/ethereumjs-util", "ethereumjs-util"],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          react: "React",
          "ethereumjs-util": "ethereumjs-util",
        },
        sourcemapExcludeSources: true,
      },
    },
  },
  esbuild: false,
  plugins: [
    rholang({
      patterns: [
        {
          matchTokens: ["// Start_Exports", "// End_Exports"],
          path: "src/rholang/nft2/**/*.rho",
        },
      ],
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
