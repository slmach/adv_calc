import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // GitHub Pages: https://slmach.github.io/adv_calc/
  base: '/adv_calc/',
});
