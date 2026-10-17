/**
 * OpenAI `strict: true` JSON schemas require every object property to appear in
 * `required`. Zod marks optional fields as present-but-not-required, which OpenAI rejects.
 * @param {Record<string, unknown>} schema
 */
function strictifyForOpenAi(schema) {
  if (!schema || typeof schema !== 'object') return schema
  if (Array.isArray(schema)) {
    return schema.map((entry) => strictifyForOpenAi(entry))
  }

  if (schema.type === 'object' && schema.properties && typeof schema.properties === 'object') {
    for (const value of Object.values(schema.properties)) {
      strictifyForOpenAi(value)
    }
    schema.required = Object.keys(schema.properties)
    schema.additionalProperties = false
  }

  if (schema.type === 'array' && schema.items) {
    strictifyForOpenAi(schema.items)
  }

  for (const key of ['anyOf', 'oneOf', 'allOf']) {
    if (Array.isArray(schema[key])) {
      schema[key].forEach((entry) => strictifyForOpenAi(entry))
    }
  }

  return schema
}

/**
 * OpenAI Structured Outputs expect an inline JSON Schema (draft-7).
 * zod-to-json-schema does not support Zod v4 — use Zod's native toJSONSchema().
 * @param {import('zod').ZodTypeAny} zodSchema
 */
export function zodToOpenAiJsonSchema(zodSchema) {
  const schema = zodSchema.toJSONSchema({ target: 'draft-7' })
  delete schema.$schema
  return strictifyForOpenAi(schema)
}
