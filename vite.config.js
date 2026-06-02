import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Set base to your GitHub repo name, e.g. '/basketball/'
// Change 'basketball' below to match your actual repository name.
export default defineConfig({
  plugins: [vue()],
  // For GitHub Pages project site, set base to your repository name.
  // Change '/basketball/' if your repo name differs.
  base: '/basketball/',
})
