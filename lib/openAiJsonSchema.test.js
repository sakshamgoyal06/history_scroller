import { describe, expect, it } from 'vitest'
import { ModelPlanResponseSchema, LessonCoreSchema, LessonPresentationSchema } from './learningPathSchemas.js'
import { zodToOpenAiJsonSchema } from './openAiJsonSchema.js'

/** OpenAI strict mode: every object lists all properties as required and forbids extras. */
function collectStrictViolations(node, path = '$', out = []) {
  if (!node || typeof node !== 'object') return out
  if (Array.isArray(node)) {
    node.forEach((child, i) => collectStrictViolations(child, `${path}[${i}]`, out))
    return out
  }
  if (node.type === 'object' && node.properties) {
    const keys = Object.keys(node.properties)
    const required = new Set(node.required ?? [])
    if (keys.some((k) => !required.has(k))) out.push(`${path}: not all properties required`)
    if (node.additionalProperties !== false) out.push(`${path}: additionalProperties not false`)
  }
  for (const [key, value] of Object.entries(node)) collectStrictViolations(value, `${path}.${key}`, out)
  return out
}

describe('zodToOpenAiJsonSchema', () => {
  it.each([
    ['plan', ModelPlanResponseSchema],
    ['lesson core', LessonCoreSchema],
    ['lesson presentation', LessonPresentationSchema],
  ])('produces a strict-mode-compatible schema for the %s', (_name, schema) => {
    const json = zodToOpenAiJsonSchema(schema)
    expect(json.$schema).toBeUndefined()
    expect(collectStrictViolations(json)).toEqual([])
  })
})
