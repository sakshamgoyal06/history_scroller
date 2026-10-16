import http from 'node:http'
import planHandler from '../api/plan-learning-path.js'
import lessonHandler from '../api/generate-lesson.js'

const PORT = Number(process.env.LEARN_API_PORT || 3001)

function createReqRes(nodeReq, nodeRes) {
  const url = new URL(nodeReq.url ?? '/', `http://localhost:${PORT}`)
  nodeReq.url = url.pathname
  return { req: nodeReq, res: nodeRes }
}

const server = http.createServer(async (nodeReq, nodeRes) => {
  nodeRes.setHeader('Access-Control-Allow-Origin', '*')
  nodeRes.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  nodeRes.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (nodeReq.method === 'OPTIONS') {
    nodeRes.statusCode = 204
    nodeRes.end()
    return
  }

  const { req, res } = createReqRes(nodeReq, nodeRes)

  try {
    if (urlPath(nodeReq) === '/api/plan-learning-path') {
      await planHandler(req, res)
      return
    }
    if (urlPath(nodeReq) === '/api/generate-lesson') {
      await lessonHandler(req, res)
      return
    }
    res.statusCode = 404
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Not found', code: 'NOT_FOUND' }))
  } catch (e) {
    console.error('[dev-api]', e)
    if (!nodeRes.headersSent) {
      nodeRes.statusCode = 500
      nodeRes.setHeader('Content-Type', 'application/json')
      nodeRes.end(JSON.stringify({ error: 'Internal error', code: 'INTERNAL' }))
    }
  }
})

function urlPath(nodeReq) {
  try {
    return new URL(nodeReq.url ?? '/', `http://localhost:${PORT}`).pathname
  } catch {
    return nodeReq.url
  }
}

server.listen(PORT, () => {
  console.info(`[dev-api] listening on http://localhost:${PORT}`)
})
