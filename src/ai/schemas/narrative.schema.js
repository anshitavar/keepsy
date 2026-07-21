// src/ai/schemas/narrative.schema.js
// JSON Schema for the narrative generation output.
// Used for documentation and potential runtime validation.

export const narrativeSchema = {
  $id: 'https://kepsyi.com/schemas/narrative-generation.json',
  title: 'Narrative Generation Result',
  type: 'object',
  required: ['title', 'summary', 'timeline', 'chapters', 'dominantJourney', 'keyMoments', 'emotionalProgression', 'confidence'],
  properties: {
    title: {
      type: 'string',
      description: 'Title of the memory narrative',
      minLength: 1,
      maxLength: 200
    },
    summary: {
      type: 'string',
      description: 'Brief summary of the memory narrative',
      minLength: 1,
      maxLength: 500
    },
    timeline: {
      type: 'string',
      description: 'Raw timeline string or structured representation (for future extension)',
      // We'll keep it as a string for now, no constraints
    },
    chapters: {
      type: 'array',
      description: 'Sequence of chapters that make up the narrative',
      items: {
        type: 'object',
        required: ['chapterId', 'clusterId', 'title', 'summary', 'startIndex', 'endIndex', 'importance', 'transitionToNext'],
        properties: {
          chapterId: {
            type: 'string',
            description: 'Unique identifier for the chapter',
            pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          },
          clusterId: {
            type: 'string',
            description: 'ID of the cluster this chapter primarily represents',
            pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          },
          title: {
            type: 'string',
            description: 'Title of the chapter',
            minLength: 1,
            maxLength: 100
          },
          summary: {
            type: 'string',
            description: 'Brief summary of the chapter',
            minLength: 1,
            maxLength: 200
          },
          startIndex: {
            type: 'integer',
            description: 'Index of the first memory in the chapter (within the clustered sequence)',
            minimum: 0
          },
          endIndex: {
            type: 'integer',
            description: 'Index of the last memory in the chapter (within the clustered sequence)',
            minimum: 0
          },
          importance: {
            type: 'number',
            description: 'Relative importance of the chapter (0‑1)',
            minimum: 0,
            maximum: 1
          },
          transitionToNext: {
            type: 'string',
            description: 'Note on how this chapter transitions to the next (e.g., \"continued\", \"shifted\", \"concluded\")',
            enum: ['continued', 'shifted', 'concluded', 'null']
          }
        },
        additionalProperties: false
      }
    },
    dominantJourney: {
      type: 'string',
      description: 'The dominant journey or arc of the narrative (e.g., \"from struggle to triumph\", \"a day in the life\")',
      minLength: 1
    },
    keyMoments: {
      type: 'array',
      description: 'Key moments in the narrative (could be indices or descriptions)',
      items: {
        type: 'string'
      }
    },
    emotionalProgression: {
      type: 'array',
      description: 'Sequence of emotional states across the narrative',
      items: {
        type: 'string',
        description: 'Emotion label (e.g., joy, contentment, etc.)'
        // We'll not enforce enum to allow flexibility
      }
    },
    confidence: {
      type: 'number',
      description: 'Overall confidence in the narrative generation (0‑1)',
      minimum: 0,
      maximum: 1
    }
  },
  additionalProperties: false
};