// src/ai/schemas/vision.schema.js
// JSON Schema for the vision understanding output.
// Used for documentation and potential runtime validation.

export const visionSchema = {
  $id: 'https://kepsyi.com/schemas/vision-understanding.json',
  title: 'Vision Understanding Result',
  type: 'object',
  required: ['memoryId', 'sceneDescription', 'objects', 'visualQualities', 'setting'],
  properties: {
    memoryId: {
      type: 'string',
      description: 'Unique identifier of the memory being analyzed',
      pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    },
    sceneDescription: {
      type: 'string',
      description: 'Natural language description of the scene',
      minLength: 1,
      maxLength: 500
    },
    objects: {
      type: 'array',
      description: 'Detected objects in the scene with bounding boxes and attributes',
      items: {
        type: 'object',
        required: ['label', 'confidence', 'boundingBox'],
        properties: {
          label: {
            type: 'string',
            description: 'Object class label (e.g., person, car, tree)'
          },
          confidence: {
            type: 'number',
            description: 'Confidence score for the detection (0‑1)',
            minimum: 0,
            maximum: 1
          },
          boundingBox: {
            type: 'object',
            required: ['x', 'y', 'width', 'height'],
            properties: {
              x: {
                type: 'number',
                description: 'Normalized x coordinate of top‑left corner (0‑1)',
                minimum: 0,
                maximum: 1
              },
              y: {
                type: 'number',
                description: 'Normalized y coordinate of top‑left corner (0‑1)',
                minimum: 0,
                maximum: 1
              },
              width: {
                type: 'number',
                description: 'Normalized width of bounding box (0‑1)',
                minimum: 0,
                maximum: 1
              },
              height: {
                type: 'number',
                description: 'Normalized height of bounding box (0‑1)',
                minimum: 0,
                maximum: 1
              }
            }
          },
          attributes: {
            type: 'object',
            description: 'Additional attributes of the object (e.g., color, state, action)',
            additionalProperties: {
              oneOf: [
                { type: 'string' },
                { type: 'number' },
                { type: 'boolean' }
              ]
            }
          }
        }
      }
    },
    actions: {
      type: 'array',
      description: 'Detected actions or activities in the scene',
      items: {
        type: 'object',
        required: ['verb', 'subject', 'confidence'],
        properties: {
          verb: {
            type: 'string',
            description: 'Action verb (e.g., running, eating, talking)'
          },
          subject: {
            type: 'string',
            description: 'Subject performing the action (e.g., person, group, child)'
          },
          confidence: {
            type: 'number',
            description: 'Confidence score for the action detection (0‑1)',
            minimum: 0,
            maximum: 1
          }
        }
      }
    },
    visualQualities: {
      type: 'object',
      description: 'Visual qualities and properties of the image',
      required: ['dominantColors', 'lighting', 'composition', 'motionBlur', 'noiseLevel'],
      properties: {
        dominantColors: {
          type: 'array',
          description: 'Dominant colors in the image with their prevalence',
          items: {
            type: 'object',
            required: ['color', 'percentage'],
            properties: {
              color: {
                type: 'string',
                pattern: '^#[0-9A-Fa-f]{6}$',
                description: 'CSS hex color code'
              },
              percentage: {
                type: 'number',
                description: 'Percentage of image dominated by this color (0‑100)',
                minimum: 0,
                maximum: 100
              }
            }
          },
          minItems: 1
        },
        lighting: {
          type: 'string',
          description: 'Overall lighting condition',
          enum: ['bright', 'dim', 'backlit', 'golden_hour', 'fluorescent', 'mixed', 'unknown']
        },
        composition: {
          type: 'object',
          description: 'Compositional elements of the image',
          properties: {
            ruleOfThirds: {
              type: 'boolean',
              description: 'Whether the image follows the rule of thirds'
            },
            leadingLines: {
              type: 'boolean',
              description: 'Whether the image contains leading lines'
            },
            symmetry: {
              type: 'string',
              description: 'Type of symmetry present',
              enum: ['horizontal', 'vertical', 'radial', 'none']
            },
            depthOfField: {
              type: 'string',
              description: 'Depth of field effect',
              enum: ['shallow', 'moderate', 'deep']
            }
          }
        },
        motionBlur: {
          type: 'number',
          description: 'Amount of motion blur (0‑1)',
          minimum: 0,
          maximum: 1
        },
        noiseLevel: {
          type: 'number',
          description: 'Amount of image noise (0‑1)',
          minimum: 0,
          maximum: 1
        }
      }
    },
    setting: {
      type: 'object',
      description: 'Inferred setting and context of the image',
      properties: {
        locationType: {
          type: 'string',
          description: 'General location type',
          enum: ['indoor', 'outdoor', 'urban', 'natural', 'water', 'mountain', 'unknown']
        },
        weather: {
          oneOf: [
            { type: 'string', enum: ['sunny', 'cloudy', 'rainy', 'snowy', 'foggy', 'clear', 'unknown'] },
            { type: 'null' }
          ]
        },
        timeOfDay: {
          type: 'string',
          description: 'Time of day when image was taken',
          enum: ['dawn', 'morning', 'afternoon', 'dusk', 'night', 'unknown']
        }
      }
    },
    // Optional fields that may be present depending on model capabilities
    emotion: {
      type: 'string',
      description: 'Detected primary emotion in the scene',
      enum: ['joy', 'contentment', 'nostalgia', 'excitement', 'serenity', 'wonder', 'tenderness', 'pride', 'amusement', 'neutral']
    },
    architecture: {
      oneOf: [
        { type: 'string', enum: ['modern', 'traditional', 'rustic', 'futuristic', 'unknown'] },
        { type: 'null' }
      ]
    },
    food: {
      type: 'boolean',
      description: 'Whether food is present in the scene'
    },
    travel: {
      type: 'boolean',
      description: 'Whether travel‑related elements are present'
    },
    festival: {
      type: 'boolean',
      description: 'Whether festival or celebration elements are present'
    },
    cameraStyle: {
      oneOf: [
        { type: 'string', enum: ['portrait', 'landscape', 'macro', 'wide_angle', 'telephoto', 'fisheye', 'unknown'] },
        { type: 'null' }
      ]
    },
    compositionNotes: {
      type: 'string',
      description: 'Additional notes about composition from the model',
      maxLength: 200
    },
    confidence: {
      type: 'number',
      description: 'Overall confidence in the analysis (0‑1)',
      minimum: 0,
      maximum: 1
    }
  },
  additionalProperties: false
};