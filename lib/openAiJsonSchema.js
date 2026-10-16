/**
 * OpenAI Structured Outputs expect an inline JSON Schema (draft-7).
 * zod-to-json-schema does not support Zod v4 — use Zod's native toJSONSchema().
 * @param {import('zod').ZodTypeAny} zodSchema
 */
export function zodToOpenAiJsonSchema(zodSchema) {
  const schema = zodSchema.toJSONSchema({ target: 'draft-7' })
  delete schema.$schema
  return schema
}
