import { Readable } from 'node:stream'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resetThrottle } from '../lib/serverUtils.js'

vi.mock('../lib/openaiPlanner.js', () => ({ runLearningPathPlanner: vi.fn() }))

const { runLearningPathPlanner } = await import('../lib/openaiPlanner.js')
const { default: handler } = await import('./plan-learning-path.js')

function call({ method = 'POST', body } = {}) {
  const req = Readable.from(body === undefined ? [] : [Buffer.from(JSON.stringify(body))])
  req.method = method
  req.headers = { 'x-real-ip': '9.9.9.9' }
  const res = {
    statusCode: 0,
    headers: {},
    setHeader(k, v) {
      this.headers[k.toLowerCase()] = v
    },
    end(text) {
      this.body = JSON.parse(text)
    },
  }
  return handler(req, res).then(() => res)
}

const validRequest = { topic: 'RBI monetary policy', level: 'curious', geographicScope: 'india', requestedLength: 3 }

const lesson = (n) => ({
  id: `m${n}`,
  order: n,
  title: `Lesson ${n}`,
  curiosityQuestion: 'Why?',
  objective: 'Understand',
  whyThisComesNow: 'Because',
  prerequisites: [],
  estimatedMinutes: 5,
  lessonBrief: {
    keyConcepts: [],
    importantQuestions: [],
    exampleToUse: 'x',
    misconceptionToAddress: 'y',
    sourceQueries: [],
    videoSearchQuery: 'z',
  },
})

const modelPlan = {
  inputStatus: 'valid',
  scopeDecision: 'single_path',
  normalizedTopic: 'RBI monetary policy',
  interpretedGoal: 'Learn how the RBI sets rates',
  scopeExplanation: 'Fits one path',
  assumptions: [],
  clarification: null,
  course: {
    id: 'c',
    title: 'RBI monetary policy',
    overview: 'Overview',
    level: 'curious',
    geographicScope: 'india',
    estimatedMinutes: 30,
    recommendedTrackId: 't',
    tracks: [{ id: 't', title: 'Track', summary: 'S', order: 1, estimatedMinutes: 30, lessons: [1, 2, 3, 4, 5].map(lesson) }],
  },
}

describe('POST /api/plan-learning-path', () => {
  beforeEach(() => {
    resetThrottle()
    vi.stubEnv('OPENAI_API_KEY', 'test-key')
    vi.stubEnv('OPENAI_MODEL', 'test-model')
    runLearningPathPlanner.mockReset()
  })
  afterEach(() => vi.unstubAllEnvs())

  it('rejects non-POST methods', async () => {
    expect((await call({ method: 'GET' })).statusCode).toBe(405)
  })

  it('returns 503 MISSING_CONFIGURATION without OpenAI env vars', async () => {
    vi.stubEnv('OPENAI_API_KEY', '')
    const res = await call({ body: validRequest })
    expect(res.statusCode).toBe(503)
    expect(res.body.code).toBe('MISSING_CONFIGURATION')
  })

  it('validates the request body', async () => {
    const res = await call({ body: { ...validRequest, requestedLength: 9 } })
    expect(res.statusCode).toBe(400)
    expect(res.body.code).toBe('VALIDATION_ERROR')
    expect(runLearningPathPlanner).not.toHaveBeenCalled()
  })

  it('returns a normalized plan with server-assigned IDs', async () => {
    runLearningPathPlanner.mockResolvedValue(modelPlan)
    const res = await call({ body: validRequest })
    expect(res.statusCode).toBe(200)
    expect(res.body.schemaVersion).toBe(1)
    const lessons = res.body.course.tracks[0].lessons
    expect(lessons).toHaveLength(3)
    expect(lessons.every((l) => l.id.startsWith('lesson-'))).toBe(true)
    expect(res.body.course.recommendedTrackId).toBe(res.body.course.tracks[0].id)
  })

  it('maps planner failures to a safe error without leaking details', async () => {
    runLearningPathPlanner.mockRejectedValue(Object.assign(new Error('secret upstream detail'), { status: 500 }))
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = await call({ body: validRequest })
    spy.mockRestore()
    expect(res.statusCode).toBe(500)
    expect(JSON.stringify(res.body)).not.toContain('secret upstream detail')
    expect(res.body.requestId).toMatch(/^[a-f0-9]{16}$/)
  })

  it('rate-limits a single client', async () => {
    runLearningPathPlanner.mockResolvedValue(modelPlan)
    const statuses = []
    for (let i = 0; i < 13; i += 1) statuses.push((await call({ body: validRequest })).statusCode)
    expect(statuses.at(-1)).toBe(429)
  })
})
