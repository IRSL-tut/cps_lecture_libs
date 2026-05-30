import { defineConfig } from 'vite'
import fs from 'fs'

export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync('./js/key.pem'),
      cert: fs.readFileSync('./js/cert.pem')
    },
    hmr: {
      host: 'localhost',
      protocol: 'ws'
    },
    host: true,
    port: 5173
  }
})
