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
    plugins: [
        rholang({
            entryUri: 'rho:id:zphjgsfy13h1k85isc8rtwtgt3t9zzt5pjd5ihykfmyapfc4wt3x5h',
        }),
    ],
})
