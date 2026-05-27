import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** Для GitHub Pages: /adv_calc/; локально: / */
const base = process.env.VITE_BASE_PATH || '/';

export default defineConfig({
  base,
  plugins: [react()],
});
