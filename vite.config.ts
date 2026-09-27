import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { defineConfig } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react(), viteSingleFile()],
  base: './',
  resolve: {
    alias: [
      {
        find: /^x-data-spreadsheet$/,
        replacement: path.resolve(import.meta.dirname, 'node_modules/x-data-spreadsheet/dist/xspreadsheet.js'),
      },
    ],
  },
})

