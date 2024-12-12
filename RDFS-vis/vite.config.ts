import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: "/CG-Art/RSFS-vis/",
  build: {
    outDir: './dist/RSFS-vis/',
  },
})
