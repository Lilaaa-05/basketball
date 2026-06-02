import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Set base to your GitHub repo name, e.g. '/basketball/'
// Change 'basketball' below to match your actual repository name.
export default defineConfig({
  plugins: [vue()],
  // For GitHub Pages user site (username.github.io) use '/'.
  // If you're deploying to a project page (username.github.io/repo),
  // set this to '/your-repo-name/'.
  base: '/',
})
