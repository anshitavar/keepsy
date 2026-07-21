// src/ai/schemas/cluster.schema.js
// JSON Schema for the memory clustering output.
// Used for documentation and potential runtime validation.

export const clusterSchema = {
  $id: 'https://kepsyi.com/schemas/memory-clustering.json',
  title: 'Memory Clustering Result',
  type: 'array',
  items: {
    type: 'object',
    required: ['clusterId', 'memories', 'confidence', 'dominantScene', 'dominantObjects', 'dominantEmotion', 'dominantSetting', 'estimatedEventType', 'temporalHints', 'visualSimilarity', 'peopleSimilarity', 'colorSimilarity'],
    properties: {
      clusterId: {
        type: 'string',
        description: 'Unique identifier for the cluster',
        pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      },
      memories: {
        type: 'array',
        description: 'Array of vision understanding results that belong to this cluster',
        items: {
          // Reference to vision schema items, but we'll just use object for simplicity
          type: 'object'
        }
      },
      confidence: {
        type: 'number',
        description: 'Confidence score for the cluster (0‑1)',
        minimum: 0,
        maximum: 1
      },
      dominantScene: {
        type: 'string',
        description: 'Most common scene description in the cluster'
      },
      dominantObjects: {
        type: 'array',
        description: 'Most frequent object labels in the cluster',
        items: {
          type: 'string'
        }
      },
      dominantEmotion: {
        type: 'string',
        description: 'Most frequent emotion in the cluster',
        enum: ['joy', 'contentment', 'nostalgia', 'excitement', 'serenity', 'wonder', 'tenderness', 'pride', 'amusement', 'neutral', null]
      },
      dominantSetting: {
        type: 'object',
        description: 'Aggregated setting information for the cluster',
        properties: {
          locationType: {
            type: 'string',
            description: 'Most common location type',
            enum: ['indoor', 'outdoor', 'urban', 'natural', 'water', 'mountain', 'unknown', null]
          },
          weather: {
            type: 'string',
            description: 'Most common weather condition',
            enum: ['sunny', 'cloudy', 'rainy', 'snowy', 'foggy', 'clear', 'unknown', null]
          },
          timeOfDay: {
            type: 'string',
            description: 'Most common time of day',
            enum: ['dawn', 'morning', 'afternoon', 'dusk', 'night', 'unknown', null]
          }
        },
        additionalProperties: false
      },
      estimatedEventType: {
        type: 'string',
        description: 'Inferred event type (e.g., birthday, vacation)',
        enum: ['birthday', 'vacation', 'holiday', 'graduation', 'wedding', 'sports', 'concert', 'travel', 'party', 'other', null]
      },
      temporalHints: {
        type: 'object',
        description: 'Temporal clues (timestamps, sequences) - null if not available',
        additionalProperties: true
      },
      visualSimilarity: {
        type: 'number',
        description: 'Average visual similarity between memories in the cluster (0‑1)',
        minimum: 0,
        maximum: 1
      },
      peopleSimilarity: {
        type: 'number',
        description: 'Proportion of memories in the cluster containing people (0‑1)',
        minimum: 0,
        maximum: 1
      },
      colorSimilarity: {
        type: 'number',
        description: 'Average color similarity between memories in the cluster (0‑1)',
        minimum: 0,
        maximum: 1
      }
    },
    additionalProperties: false
  }
};