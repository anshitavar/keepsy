// src/ai/schemas/affect.schema.js
// JSON Schema for the affect analysis output.
// Used for documentation and potential runtime validation.

export const affectSchema = {
  $id: 'https://kepsyi.com/schemas/affect-analysis.json',
  title: 'Affect Analysis Result',
  type: 'array',
  items: {
    type: 'object',
    required: ['clusterId', 'primaryEmotion', 'secondaryEmotion', 'confidence', 'energy', 'nostalgia', 'celebration', 'calmness', 'intimacy', 'spontaneity', 'socialDensity', 'visualMood', 'emotionalArc'],
    properties: {
      clusterId: {
        type: 'string',
        description: 'Unique identifier of the cluster this affect analysis belongs to',
        pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      },
      primaryEmotion: {
        type: 'string',
        description: 'Primary emotion detected in the cluster',
        enum: ['joy', 'contentment', 'nostalgia', 'excitement', 'serenity', 'wonder', 'tenderness', 'pride', 'amusement', 'neutral']
      },
      secondaryEmotion: {
        type: 'string',
        description: 'Secondary emotion detected in the cluster (can be same as primary if no strong secondary)',
        enum: ['joy', 'contentment', 'nostalgia', 'excitement', 'serenity', 'wonder', 'tenderness', 'pride', 'amusement', 'neutral', null]
      },
      confidence: {
        type: 'number',
        description: 'Confidence in the emotion detection (0‑1)',
        minimum: 0,
        maximum: 1
      },
      energy: {
        type: 'number',
        description: 'Level of energy (calm to energetic) (0‑1)',
        minimum: 0,
        maximum: 1
      },
      nostalgia: {
        type: 'number',
        description: 'Level of nostalgia evoked (0‑1)',
        minimum: 0,
        maximum: 1
      },
      celebration: {
        type: 'number',
        description: 'Level of celebration/festivity (0‑1)',
        minimum: 0,
        maximum: 1
      },
      calmness: {
        type: 'number',
        description: 'Level of calmness/relaxation (0‑1)',
        minimum: 0,
        maximum: 1
      },
      intimacy: {
        type: 'number',
        description: 'Level of intimacy/closeness (0‑1)',
        minimum: 0,
        maximum: 1
      },
      spontaneity: {
        type: 'number',
        description: 'Level of spontaneity/unplanned feeling (0‑1)',
        minimum: 0,
        maximum: 1
      },
      socialDensity: {
        type: 'number',
        description: 'Proportion of memories in the cluster containing people (0‑1)',
        minimum: 0,
        maximum: 1
      },
      visualMood: {
        type: 'string',
        description: 'Overall visual mood inferred from color, lighting, composition',
        enum: ['bright', 'dim', 'warm', 'cool', 'muted', 'vibrant', 'monochrome', 'contrasty']
      },
      emotionalArc: {
        type: 'string',
        description: 'How emotion evolves across the cluster (e.g., rising, falling, stable)',
        enum: ['rising', 'falling', 'stable', 'mixed']
      }
    },
    additionalProperties: false
  }
};