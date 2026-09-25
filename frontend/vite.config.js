import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Content Security Policy della build (npm run preview): script solo dalla nostra origine,
// niente script inline né eval. In sviluppo non si applica perché Vite inietta script inline per l'aggiornamento a caldo
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https: data:",
  "connect-src 'self' http://localhost:8080",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ')

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // In sviluppo le chiamate a /api le inoltra Vite al backend sulla 8080
    proxy: {
      '/api': { target: 'http://localhost:8080' },
    },
  },
  preview: {
    proxy: {
      '/api': { target: 'http://localhost:8080' },
    },
    headers: {
      'Content-Security-Policy': CSP,
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
    },
  },
})
