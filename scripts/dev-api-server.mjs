// Local API for `npm run dev` (Vite proxies /api here). Same routes as production.
import { createAppServer } from '../server/app.js'

const PORT = Number(process.env.LEARN_API_PORT || 3001)

createAppServer({ cors: true }).listen(PORT, () => {
  console.info(`[dev-api] listening on http://localhost:${PORT}`)
})
