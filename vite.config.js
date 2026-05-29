import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Set base to your GitHub repo name, e.g. '/basketball/'
// Change 'basketball' below to match your actual repository name.
export default defineConfig({
  plugins: [vue()],
  base: '/basketball/',
})
