// src/ai/pipeline/affectAnalysis.js
// Takes clustered memories and returns affect analysis for each cluster.

import { affectSchema } from '../schemas/affect.schema.js'; // imported for reference; we won't validate at runtime to avoid overhead

/**
 * Analyze affect (emotional tone) for each cluster.
 * @param {Object} context - Shared pipeline context.
 *        Expects: context.clusters (Array<Object>), context.diagnostics (optional)
 *        Writes: context.affect (Array<Object>)
 *        Also updates: context.diagnostics.errors and .warnings
 */
export async function affectAnalysis(context) {
  // Initialize diagnostics if not present
  if (!context.diagnostics) {
    context.diagnostics = { warnings: [], errors: [] };
  }

  // Validate input
  if (!context || !Array.isArray(context.clusters)) {
    context.affect = [];
    context.diagnostics.errors.push({
      stage: 'affectAnalysis',
      message: 'Invalid or missing clusters in context',
      timestamp: new Date().toISOString()
    });
    return;
  }

  try {
    const affectResults = [];

    for (const cluster of context.clusters) {
      // Guard against malformed cluster
      if (!cluster || !Array.isArray(cluster.memories)) {
        continue;
      }

      const memories = cluster.memories;

      // --- Helper to get emotion from a vision result ---
      const getEmotion = (m) => (m.emotion || 'neutral');

      // Count emotions
      const emotionCounts = {};
      memories.forEach(m => {
        const e = getEmotion(m);
        emotionCounts[e] = (emotionCounts[e] || 0) + 1;
      });

      // Sort emotions by frequency descending
      const sortedEmotions = Object.entries(emotionCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([emotion]) => emotion);

      const primaryEmotion = sortedEmotions[0] || 'neutral';
      const secondaryEmotion = sortedEmotions[1] || null;

      // Confidence: average confidence of memories in cluster
      const totalConfidence = memories.reduce((sum, m) => sum + (m.confidence || 0), 0);
      const confidence = memories.length ? totalConfidence / memories.length : 0;

      // Energy level: proxy via average motionBlur (0-1)
      const totalMotionBlur = memories.reduce((sum, m) => {
        const vb = m.visualQualities?.motionBlur;
        return sum + (typeof vb === 'number' ? vb : 0);
      }, 0);
      const energy = memories.length ? Math.min(1, totalMotionBlur / memories.length) : 0;

      // Nostalgia level: placeholder (could be derived from metadata like timestamp age, but we avoid)
      const nostalgia = 0.5; // neutral placeholder

      // Celebration level: placeholder
      const celebration = 0.0;

      // Calmness level: inverse of energy (simple)
      const calmness = Math.max(0, 1 - energy);

      // Intimacy level: proportion of memories containing people
      let peopleCount = 0;
      memories.forEach(m => {
        const hasPerson = (m.objects || []).some(o => o.label?.toLowerCase() === 'person');
        if (hasPerson) peopleCount++;
      });
      const intimacy = memories.length ? peopleCount / memories.length : 0;

      // Spontaneity level: placeholder
      const spontaneity = 0.5;

      // Social density: same as intimacy (proportion with people)
      const socialDensity = intimacy;

      // Visual mood: placeholder based on average brightness? We don't have brightness. Use dominant color variety?
      // We'll set a default.
      const visualMood = 'muted';

      // Emotional arc: placeholder (assume stable within cluster)
      const emotionalArc = 'stable';

      affectResults.push({
        clusterId: cluster.clusterId,
        primaryEmotion,
        secondaryEmotion,
        confidence,
        energy,
        nostalgia,
        celebration,
        calmness,
        intimacy,
        spontaneity,
        socialDensity,
        visualMood,
        emotionalArc
      });
    }

    context.affect = affectResults;
  } catch (error) {
    console.error('Affect analysis failed:', error);
    context.affect = []; // Return empty array on error to keep pipeline alive
    context.diagnostics.errors.push({
      stage: 'affectAnalysis',
      message: 'Affect analysis failed, setting empty affect',
      detail: error.message,
      timestamp: new Date().toISOString()
    });
  }
}