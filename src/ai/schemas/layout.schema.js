// src/ai/schemas/layout.schema.js
// JSON Schema for the layout intelligence output.
// Used for documentation and potential runtime validation.

export const layoutSchema = {
  $id: 'https://kepsyi.com/schemas/layout-intelligence.json',
  title: 'Layout Intelligence Result',
  type: 'object',
  required: ['pages', 'globalFlow'],
  properties: {
    pages: {
      type: 'array',
      description: 'Array of pages in the layout',
      items: {
        type: 'object',
        required: ['pageId', 'chapterId', 'layoutType', 'orientation', 'photoSlots', 'textBlocks', 'decorations', 'background', 'whitespace', 'balance', 'confidence'],
        properties: {
          pageId: {
            type: 'string',
            description: 'Unique identifier for the page',
            pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          },
          chapterId: {
            type: 'string',
            description: 'ID of the chapter this page corresponds to',
            pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          },
          layoutType: {
            type: 'string',
            description: 'Type of layout (e.g., "grid", "vertical", "horizontal", "masonry")',
            enum: ['grid', 'vertical', 'horizontal', 'masonry', 'freeform']
          },
          orientation: {
            type: 'string',
            description: 'Page orientation',
            enum: ['portrait', 'landscape', 'square']
          },
          photoSlots: {
            type: 'array',
            description: 'Slots for placing photos/memories',
            items: {
              type: 'object',
              required: ['memoryId', 'x', 'y', 'width', 'height', 'rotation', 'zIndex', 'importance'],
              properties: {
                memoryId: {
                  type: 'string',
                  description: 'ID of the memory (could be index or derived from cluster)',
                  // We'll generate a simple ID based on cluster and memory index
                  pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$|^mem-\\d+-\\d+$'
                },
                x: {
                  type: 'number',
                  description: 'X coordinate (in arbitrary units, e.g., pixels from left)'
                },
                y: {
                  type: 'number',
                  description: 'Y coordinate (in arbitrary units, e.g., pixels from top)'
                },
                width: {
                  type: 'number',
                  description: 'Width of the photo slot'
                },
                height: {
                  type: 'number',
                  description: 'Height of the photo slot'
                },
                rotation: {
                  type: 'number',
                  description: 'Rotation in degrees (-180 to 180)',
                  minimum: -180,
                  maximum: 180
                },
                zIndex: {
                  type: 'integer',
                  description: 'Stacking order (higher is on top)'
                },
                importance: {
                  type: 'number',
                  description: 'Relative importance of the photo (0-1)',
                  minimum: 0,
                  maximum: 1
                }
              },
              additionalProperties: false
            }
          },
          textBlocks: {
            type: 'array',
            description: 'Text blocks (titles, captions, etc.)',
            items: {
              type: 'object',
              required: ['type', 'contentSource', 'x', 'y', 'width', 'alignment'],
              properties: {
                type: {
                  type: 'string',
                  description: 'Type of text block (e.g., "title", "subtitle", "caption", "body")',
                  enum: ['title', 'subtitle', 'caption', 'body']
                },
                contentSource: {
                  type: 'string',
                  description: 'Source of the text (e.g., chapter title, summary, or static)'
                },
                x: {
                  type: 'number',
                  description: 'X coordinate'
                },
                y: {
                  type: 'number',
                  description: 'Y coordinate'
                },
                width: {
                  type: 'number',
                  description: 'Width of the text block'
                },
                alignment: {
                  type: 'string',
                  description: 'Text alignment',
                  enum: ['left', 'center', 'right', 'justify']
                }
              },
              additionalProperties: false
            }
          },
          decorations: {
            type: 'array',
            description: 'Decorative elements (stickers, shapes, etc.)',
            items: {
              type: 'object',
              required: ['type', 'x', 'y', 'scale', 'rotation'],
              properties: {
                type: {
                  type: 'string',
                  description: 'Type of decoration (e.g., "sticker", "line", "shape", "flare")'
                  // We'll keep it open-ended for now
                },
                x: {
                  type: 'number',
                  description: 'X coordinate'
                },
                y: {
                  type: 'number',
                  description: 'Y coordinate'
                },
                scale: {
                  type: 'number',
                  description: 'Scale factor (1 = normal size)',
                  minimum: 0
                },
                rotation: {
                  type: 'number',
                  description: 'Rotation in degrees',
                  minimum: -180,
                  maximum: 180
                }
              },
              additionalProperties: false
            }
          },
          background: {
            type: 'object',
            description: 'Background specification',
            properties: {
              type: {
                type: 'string',
                description: 'Background type (e.g., "solid", "gradient", "image", "pattern")',
                enum: ['solid', 'gradient', 'image', 'pattern']
              },
              color: {
                type: 'string',
                description: 'For solid background: color hex code',
                pattern: '^#[0-9A-F]{6}$'
              },
              gradient: {
                type: 'object',
                description: 'For gradient background: color stops',
                additionalProperties: true
              },
              image: {
                type: 'string',
                description: 'For image background: URL or identifier'
              },
              pattern: {
                type: 'string',
                description: 'For pattern background: pattern identifier'
              }
            },
            additionalProperties: false
          },
          whitespace: {
            type: 'number',
            description: 'Amount of whitespace on the page (0-1)',
            minimum: 0,
            maximum: 1
          },
          balance: {
            type: 'string',
            description: 'Visual balance assessment (e.g., "symmetric", "asymmetric", "radial")',
            enum: ['symmetric', 'asymmetric', 'radial', 'vertical', 'horizontal']
          },
          confidence: {
            type: 'number',
            description: 'Confidence in the layout (0-1)',
            minimum: 0,
            maximum: 1
          }
        },
        additionalProperties: false
      }
    },
    globalFlow: {
      type: 'string',
      description: 'Description of the overall flow of the scrapbook (e.g., "chronological", "thematic", "narrative")',
      enum: ['chronological', 'thematic', 'narrative', 'random', 'sequential']
    }
  },
  additionalProperties: false
};