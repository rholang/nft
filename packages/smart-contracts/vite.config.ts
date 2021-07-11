import { defineConfig } from 'vite'
// import dts from 'vite-plugin-dts'
import rholang from 'vite-plugin-rholang'

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        lib: {
            entry: 'src/index.ts',
            name: 'nft',
        },
    },
    plugins: [rholang()],
})
