// Production entrypoint (Railway runs `npm start`): serves dist/ and the /api endpoints.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createAppServer } from './app.js'

const PORT = Number(process.env.PORT || 3000)
const distDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist')

const server = createAppServer({ distDir })

server.listen(PORT, () => {
  console.info(`[server] listening on port ${PORT}`)
})

// Railway sends SIGTERM on redeploy: stop accepting work, let in-flight lessons finish.
function shutdown(signal) {
  console.info(`[server] ${signal} received, draining`)
  server.close(() => process.exit(0))
  setTimeout(() => process.exit(0), 290_000).unref()
}
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
