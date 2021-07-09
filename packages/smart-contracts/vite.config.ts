import { defineConfig } from 'vite'
import dts from 'vite-plugin-rholang'

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        lib: {
            entry: 'src/index.ts',
            name: 'nft',
        },
    },
    plugins: [
        dts({
            insertTypesEntry: true,
        }),
    ],
})

/* import { transformAsync } from '@babel/core'
import refresh from '@vitejs/plugin-react-refresh'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import typescript2 from 'rollup-plugin-typescript2'

export default defineConfig({
    build: {
        lib: {
            entry: 'src/index.ts',
            name: 'MyLib',

            fileName: 'my-lib',
        },
        rollupOptions: {
            // make sure to externalize deps that shouldn't be bundled
            // into your library
            external: ['react'],
            output: {
                // Provide global variables to use in the UMD build
                // for externalized deps
                globals: {
                    vue: 'React',
                },
            },
        },
    },
    plugins: [
        tsconfigPaths(),
        refresh(),
        {
            ...typescript2(),
            apply: 'build',
        },
        {
            name: 'lingui-macro',
            enforce: 'pre',
            async transform(source, filename) {
                if (filename.includes('node_modules')) {
                    return
                }
                if (!source.includes('@lingui/macro')) {
                    return
                }
                const result = await transformAsync(source, {
                    filename,
                    parserOpts: {
                        plugins: ['jsx', 'typescript'],
                    },
                    plugins: ['babel-plugin-macros'],
                    babelrc: false,
                    configFile: false,
                    generatorOpts: {
                        jsescOption: {
                            // This option is mandatory.
                            // Otherwise, UTF-8 strings will be escaped in the produced code,
                            // which cannot be translated by @lingui/macro.
                            minimal: true,
                        },
                    },
                })
                return result?.code
            },
        },
    ],
})
*/
