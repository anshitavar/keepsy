// src/ai/schemas/creativeDirection.schema.js
// JSON Schema for the creative direction output.
// Used for documentation and potential runtime validation.

export const creativeDirectionSchema = {
  $id: 'https://kepsyi.com/schemas/creative-direction.json',
  title: 'Creative Direction Result',
  type: 'object',
  required: [
    'theme',
    'artStyle',
    'colorPalette',
    'paperTexture',
    'photoTreatment',
    'decorationStyle',
    'backgroundStyle',
    'typography',
    'pageMood',
    'transitionStyle',
    'visualRhythm',
    'density',
    'whitespace',
    'confidence'
  ],
  properties: {
    theme: {
      type: 'string',
      description: 'Overall theme or story direction (e.g., "Golden little things", "After-dark together")',
      minLength: 1
    },
    artStyle: {
      type: 'string',
      description: 'Artistic style (e.g., "watercolor", "vintage", "modern", "collage")',
      enum: ['watercolor', 'vintage', 'modern', 'collage', 'sketch', 'photographic', 'illustrative']
    },
    colorPalette: {
      type: 'array',
      description: 'Array of color hex codes representing the palette',
      items: {
        type: 'string',
        pattern: '^#[0-9A-F]{6}$'
      },
      minItems: 2,
      maxItems: 5
    },
    paperTexture: {
      type: 'string',
      description: 'Type of paper texture (e.g., "linen", "cotton", "recycled", "glossy")',
      enum: ['linen', 'cotton', 'recycled', 'glossy', 'matte', 'textured', 'smooth']
    },
    photoTreatment: {
      type: 'string',
      description: 'Treatment applied to photos (e.g., "sepia", "black and white", "vibrant", "matte")',
      enum: ['sepia', 'black and white', 'vibrant', 'matte', 'glossy', 'vintage', 'filtered']
    },
    decorationStyle: {
      type: 'string',
      description: 'Style of decorative elements (e.g., "minimal", "ornate", "playful", "elegant")',
      enum: ['minimal', 'ornate', 'playful', 'elegant', 'rustic', 'modern', 'vintage']
    },
    backgroundStyle: {
      type: 'string',
      description: 'Background style (e.g., "solid", "gradient", "patterned", "textured")',
      enum: ['solid', 'gradient', 'patterned', 'textured', 'image']
    },
    typography: {
      type: 'object',
      description: 'Typography choices for headings and body',
      properties: {
        headingFont: {
          type: 'string',
          description: 'Font family for headings',
          enum: ['serif', 'sans-serif', 'script', 'display', 'handwritten']
        },
        bodyFont: {
          type: 'string',
          description: 'Font family for body text',
          enum: ['serif', 'sans-serif', 'script', 'display', 'handwritten']
        },
        fontSize: {
          type: 'string',
          description: 'Base font size (e.g., "12pt", "14pt")',
          pattern: '^\\d+pt$'
        }
      },
      additionalProperties: false
    },
    pageMood: {
      type: 'string',
      description: 'Overall mood of the pages (e.g., "nostalgic", "joyful", "calm", "energetic")',
      enum: ['nostalgic', 'joyful', 'calm', 'energetic', 'peaceful', 'vibrant', 'serious', 'whimsical']
    },
    transitionStyle: {
      type: 'string',
      description: 'Style of transitions between pages (e.g., "fade", "slide", "zoom", "none")',
      enum: ['fade', 'slide', 'zoom', 'none', 'flip']
    },
    visualRhythm: {
      type: 'string',
      description: 'Visual rhythm or pacing (e.g., "steady", "dynamic", "rhythmic", "staccato")',
      enum: ['steady', 'dynamic', 'rhythmic', 'staccato', 'flowing', 'jerky']
    },
    density: {
      type: 'number',
      description: 'Visual density of elements on page (0-1, where 0 is sparse, 1 is dense)',
      minimum: 0,
      maximum: 1
    },
    whitespace: {
      type: 'number',
      description: 'Amount of whitespace (0-1, where 0 is minimal, 1 is abundant)',
      minimum: 0,
      maximum: 1
    },
    confidence: {
      type: 'number',
      description: 'Confidence in the creative direction (0-1)',
      minimum: 0,
      maximum: 1
    }
  },
  additionalProperties: false
};