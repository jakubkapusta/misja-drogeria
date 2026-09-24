import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// JS i CSS wbudowane w index.html → dist/index.html działa też otwarty z dysku (file://),
// a base './' → działa pod dowolną ścieżką (np. GitHub Pages /repo-name/).
// Screeny z src/img też są wbudowane – cała gra to jeden plik.
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
})
