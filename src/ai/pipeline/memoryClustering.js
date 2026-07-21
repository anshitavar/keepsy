// src/ai/pipeline/memoryClustering.js
// Takes vision understanding results and returns clustered memories.

import { clusterSchema } from '../schemas/cluster.schema.js'; // imported for reference; we won't validate at runtime to avoid overhead

/**
 * Cluster memories based on vision understanding results.
 * @param {Object} context - Shared pipeline context.
 *        Expects: context.vision (Array<Object>), context.diagnostics (optional)
 *        Writes: context.clusters (Array<Object>)
 *        Also updates: context.diagnostics.errors and .warnings
 */
export async function memoryClustering(context) {
  // Initialize diagnostics if not present
  if (!context.diagnostics) {
    context.diagnostics = { warnings: [], errors: [] };
  }

  // Validate input
  if (!context || !Array.isArray(context.vision)) {
    context.clusters = [];
    context.diagnostics.errors.push({
      stage: 'memoryClustering',
      message: 'Invalid or missing vision in context',
      timestamp: new Date().toISOString()
    });
    return;
  }

  try {
    // Group by sceneDescription as a simple clustering heuristic
    // In a real implementation, this would use a proper clustering algorithm (e.g., DBSCAN, hierarchical clustering)
    // on feature vectors derived from the vision results.
    const groups = {};
    for (const result of context.vision) {
      const scene = result.sceneDescription;
      if (!groups[scene]) {
        groups[scene] = [];
      }
      groups[scene].push(result);
    }

    const clusters = [];
    for (const [scene, memories] of Object.entries(groups)) {
      // Generate a cluster ID
      const clusterId = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;

      // Calculate average confidence
      const totalConfidence = memories.reduce((sum, m) => sum + (m.confidence || 0), 0);
      const confidence = memories.length > 0 ? totalConfidence / memories.length : 0;

      // Dominant scene is the scene (all same in group)
      const dominantScene = scene;

      // Dominant objects: top 3 most frequent object labels
      const objectFreq = {};
      memories.forEach(m => {
        (m.objects || []).forEach(obj => {
          const label = obj.label;
          objectFreq[label] = (objectFreq[label] || 0) + 1;
        });
      });
      const dominantObjects = Object.entries(objectFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(entry => entry[0]);

      // Dominant emotion: most frequent emotion
      const emotionFreq = {};
      memories.forEach(m => {
        const emo = m.emotion;
        if (emo) {
          emotionFreq[emo] = (emotionFreq[emo] || 0) + 1;
        }
      });
      const dominantEmotion = Object.keys(emotionFreq).length > 0
        ? Object.entries(emotionFreq).sort((a, b) => b[1] - a[1])[0][0]
        : null;

      // Dominant setting: consensus on locationType, weather, timeOfDay (if all agree, else null)
      const firstMemory = memories[0];
      const locationType = memories.every(m => m.setting?.locationType === firstMemory.setting?.locationType)
        ? firstMemory.setting?.locationType
        : null;
      const weather = memories.every(m => m.setting?.weather === firstMemory.setting?.weather)
        ? firstMemory.setting?.weather
        : null;
      const timeOfDay = memories.every(m => m.setting?.timeOfDay === firstMemory.setting?.timeOfDay)
        ? firstMemory.setting?.timeOfDay
        : null;
      const dominantSetting = {
        locationType,
        weather,
        timeOfDay
      };

      // Estimated event type: not implemented (avoiding keyword heuristics)
      const estimatedEventType = null;

      // Temporal hints: not available from vision results alone
      const temporalHints = null;

      // Similarity metrics: placeholder values (would be computed from feature vectors in real implementation)
      const visualSimilarity = 0; // Placeholder
      const peopleSimilarity = memories.length > 0
        ? memories.filter(m => (m.objects || []).some(obj => obj.label.toLowerCase() === 'person')).length / memories.length
        : 0;
      const colorSimilarity = 0; // Placeholder

      clusters.push({
        clusterId,
        memories,
        confidence,
        dominantScene,
        dominantObjects,
        dominantEmotion,
        dominantSetting,
        estimatedEventType,
        temporalHints,
        visualSimilarity,
        peopleSimilarity,
        colorSimilarity
      });
    }

    context.clusters = clusters;
  } catch (error) {
    console.error('Memory clustering failed:', error);
    context.clusters = [];
    context.diagnostics.errors.push({
      stage: 'memoryClustering',
      message: 'Memory clustering failed, setting empty clusters',
      detail: error.message,
      timestamp: new Date().toISOString()
    });
  }
}