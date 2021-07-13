import { defineConfig } from 'vite'
import ts from 'rollup-plugin-typescript2'
import rholang from 'vite-plugin-rholang'

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        lib: {
            entry: 'src/index.ts',
            name: 'nft',
        },
    },
    esbuild: false,
    plugins: [
        rholang({
            patterns: [
                {
                    matchTokens: ['// Start_Exports', '// End_Exports'],
                    path: 'src/rholang/examples/checkAccount.rho',
                },
            ],
        }),
        {
            apply: 'build',
            ...ts({
                tsconfig: './tsconfig.json',
                check: false,
                useTsconfigDeclarationDir: true,
            }),
        },
    ],
})
