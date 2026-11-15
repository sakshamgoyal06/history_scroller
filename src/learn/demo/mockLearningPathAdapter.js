import { generateMockLearningPath } from './generateMockLearningPath.js'
import { createPathRecordFromPlan } from '../learningPathStorage.js'

/**
 * Explicit demo fallback — never masquerades as live AI output.
 */
export function buildDemoPathRecord({ topic, level, scope, length, focus }) {
  const rawCards = generateMockLearningPath({ topic, level, scope, length, focus })
  const pathId = `demo-${Date.now()}`
  const trackId = `${pathId}-track-1`

  const lessons = rawCards.map((raw) => ({
    id: `${pathId}-step-${raw.order}`,
    order: raw.order,
    title: raw.title,
    curiosityQuestion: raw.hook,
    objective: raw.coreFact?.slice(0, 200) ?? raw.title,
    whyThisComesNow: raw.scene ?? '',
    prerequisites: [],
    estimatedMinutes: 4,
    lessonBrief: {
      keyConcepts: [],
      importantQuestions: [],
      exampleToUse: raw.title,
      misconceptionToAddress: '',
      sourceQueries: [raw.youtubeQuery].filter(Boolean),
      videoSearchQuery: raw.youtubeQuery ?? raw.title,
    },
    generationStatus: 'ready',
    generatedAt: Date.now(),
    generationError: null,
    lessonCore: null,
    presentation: null,
    sources: [],
    completedAt: null,
    legacyCard: {
      title: raw.title,
      domain: raw.domain,
      format: raw.format,
      hook: raw.hook,
      scene: raw.scene,
      coreFact: raw.coreFact,
      whyItMatters: raw.whyItMatters,
      rabbitHole: raw.rabbitHole,
      youtubeId: null,
      category: raw.domain,
    },
  }))

  const plan = {
    requestId: 'demo-local',
    scopeDecision: 'single_path',
    course: {
      id: pathId,
      title: `Demo: ${topic}`,
      overview: 'This path uses the built-in demo generator (not live AI).',
      level,
      geographicScope: scope,
      estimatedMinutes: lessons.length * 4,
      recommendedTrackId: trackId,
      tracks: [
        {
          id: trackId,
          title: topic,
          summary: 'Demo learning sequence',
          order: 1,
          estimatedMinutes: lessons.length * 4,
          lessons,
        },
      ],
    },
  }

  return createPathRecordFromPlan({
    plan,
    preferences: { topic, level, scope, length, focus },
    buildMode: 'single_track',
    activeTrackId: trackId,
    sourceLabel: 'demo',
    isDemo: true,
  })
}
