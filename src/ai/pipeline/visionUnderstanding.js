// src/ai/pipeline/visionUnderstanding.js
// Takes ingested memories and a vision provider, returns structured vision understanding.

import { visionSchema } from '../schemas/vision.schema.js'; // imported for reference; we won't validate at runtime to avoid overhead

/**
 * Process ingested memories through a vision provider.
 * @param {Object} context - Shared pipeline context.
 *        Expects: context.memories (Array<Object>), context.provider (VisionProvider), context.diagnostics (optional)
 *        Writes: context.vision (Array<Object>)
 *        Also updates: context.diagnostics.errors and .warnings
 */
export async function visionUnderstanding(context) {
  // Initialize diagnostics if not present
  if (!context.diagnostics) {
    context.diagnostics = { warnings: [], errors: [] };
  }

  // Validate input
  if (!context || !Array.isArray(context.memories)) {
    context.vision = [];
    context.diagnostics.errors.push({
      stage: 'visionUnderstanding',
      message: 'Invalid or missing memories in context',
      timestamp: new Date().toISOString()
    });
    return;
  }

  const provider = context.provider;
  if (!provider) {
    context.vision = [];
    context.diagnostics.errors.push({
      stage: 'visionUnderstanding',
      message: 'Vision provider is missing in context',
      timestamp: new Date().toISOString()
    });
    return;
  }

  try {
    // Separate image memories (we only run vision on images)
    const imageMemories = context.memories.filter(m => m.mimeType && m.mimeType.startsWith('image/'));
    const nonImageMemories = context.memories.filter(m => !m.mimeType || !m.mimeType.startsWith('image/'));

    const imageUrls = imageMemories.map(m => m.thumbnailUrl);

    let visionResults = [];
    if (imageUrls.length > 0) {
      visionResults = await provider.analyzeImages(imageUrls);
    }

    // Map results back to original memories, preserving order
    const output = [];
    let visionIdx = 0;

    for (const mem of context.memories) {
      if (mem.mimeType && mem.mimeType.startsWith('image/')) {
        if (visionIdx < visionResults.length) {
          const vr = visionResults[visionIdx];
          // Ensure the result includes the memoryId
          vr.memoryId = mem.id;
          output.push(vr);
          visionIdx++;
        } else {
          // Not enough vision results – use fallback
          output.push(_getFallbackVisionResult(mem.id, 'image'));
        }
      } else {
        // Non‑image (e.g., video) – provide a minimal placeholder
        output.push(_getFallbackVisionResult(mem.id, 'other'));
      }
    }

    context.vision = output;
  } catch (error) {
    console.error('Vision provider failed:', error);
    // If provider fails, we will fall back to generating fallback results for each image.
    context.vision = context.memories.map(m =>
      m.mimeType && m.mimeType.startsWith('image/')
        ? _getFallbackVisionResult(m.id, 'image')
        : _getFallbackVisionResult(m.id, 'other')
    );
    context.diagnostics.errors.push({
      stage: 'visionUnderstanding',
      message: 'Vision provider failed, using fallback results',
      detail: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Generate a fallback vision result when analysis fails or is unavailable.
 * @param {string} memoryId - ID of the memory.
 * @param {'image'|'other'} type - Whether the original was an image or other media.
 * @returns {Object} Conforms to the vision schema.
 */
function _getFallbackVisionResult(memoryId, type = 'image') {
  const isImage = type === 'image';
  return {
    memoryId,
    sceneDescription: `Unable to analyze ${isImage ? 'image' : 'media'} content`,
    objects: [],
    actions: [],
    visualQualities: {
      dominantColors: [{ color: '#808080', percentage: 100 }],
      lighting: 'unknown',
      composition: {
        ruleOfThirds: false,
        leadingLines: false,
        symmetry: 'none',
        depthOfField: 'moderate'
      },
      motionBlur: 0,
      noiseLevel: 0
    },
    setting: {
      locationType: 'unknown',
      weather: null,
      timeOfDay: 'unknown'
    },
    // Optional fields as per schema
    emotion: 'contentment',
    architecture: null,
    food: false,
    travel: false,
    festival: false,
    cameraStyle: null,
    compositionNotes: 'Analysis failed – using fallback',
    confidence: 0.1
  };
}