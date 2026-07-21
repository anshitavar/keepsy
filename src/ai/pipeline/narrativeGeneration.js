// src/ai/pipeline/narrativeGeneration.js
// Takes clustered memories and affect analysis and returns a narrative.

import { narrativeSchema } from '../schemas/narrative.schema.js'; // imported for reference; we won't validate at runtime to avoid overhead

/**
 * Generate a narrative from clustered memories and affect analysis.
 * @param {Object} context - Shared pipeline context.
 *        Expects: context.clusters (Array<Object>), context.affect (Array<Object>), context.diagnostics (optional)
 *        Writes: context.narrative (Object)
 *        Also updates: context.diagnostics.errors and .warnings
 */
export async function narrativeGeneration(context) {
  // Initialize diagnostics if not present
  if (!context.diagnostics) {
    context.diagnostics = { warnings: [], errors: [] };
  }

  // Validate input
  if (!context || !Array.isArray(context.clusters)) {
    context.narrative = null;
    context.diagnostics.errors.push({
      stage: 'narrativeGeneration',
      message: 'Invalid or missing clusters in context',
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Affect is optional but expected; if missing, we'll use empty array and warn
  if (!context.affect || !Array.isArray(context.affect)) {
    context.affect = [];
    context.diagnostics.warnings.push({
      stage: 'narrativeGeneration',
      message: 'Missing affect analysis, proceeding without it',
      timestamp: new Date().toISOString()
    });
  }

  try {
    // We'll generate chapters from clusters, using affect data where available
    const chapters = [];
    const emotionalProgression = [];
    const keyMoments = [];

    for (let i = 0; i < context.clusters.length; i++) {
      const cluster = context.clusters[i];
      const affect = context.affect[i] || {}; // get affect for this cluster, if available

      // Generate a chapter ID
      const chapterId = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;

      // Chapter title: based on dominantScene or a generic title
      const chapterTitle = cluster.dominantScene
        ? `Memories of ${cluster.dominantScene}`
        : `Chapter ${i + 1}`;

      // Chapter summary: combine dominantScene and dominantEmotion from affect if available, else from cluster
      const dominantEmotion = affect.primaryEmotion || cluster.dominantEmotion || 'neutral';
      const chapterSummary = `A cluster of memories about ${chapterTitle.toLowerCase()} with a ${dominantEmotion} tone.`;

      // Importance: we can use a combination of cluster confidence and affect confidence? Let's use cluster confidence.
      const importance = cluster.confidence !== undefined ? cluster.confidence : 1.0;

      // Transition to next
      const transitionToNext = i === context.clusters.length - 1 ? 'concluded' : 'continued';

      chapters.push({
        chapterId,
        clusterId: cluster.clusterId,
        title: chapterTitle,
        summary: chapterSummary,
        startIndex: i, // index of the cluster in the clusters array
        endIndex: i,   // same as startIndex for one cluster per chapter
        importance: Math.max(0, Math.min(1, importance)), // clamp to 0-1
        transitionToNext
      });

      // For emotionalProgression, use the primary emotion from affect (or cluster as fallback)
      emotionalProgression.push(dominantEmotion);

      // Key moment: a brief description
      keyMoments.push(`${chapterTitle}: ${dominantEmotion} emotion`);
    }

    // If we have no chapters, create a default one
    if (chapters.length === 0) {
      chapters.push({
        chapterId: crypto.randomUUID?.() || `default-${Date.now()}`,
        clusterId: 'none',
        title: 'No memories',
        summary: 'No memories were processed to form a narrative.',
        startIndex: 0,
        endIndex: 0,
        importance: 0,
        transitionToNext: 'concluded'
      });
      emotionalProgression.push('neutral');
      keyMoments.push('No memories');
    }

    // Calculate overall confidence as average of cluster confidences (or affect confidences if available)
    const confidences = context.clusters.map(c => c.confidence || 0);
    const avgConfidence = confidences.reduce((sum, val) => sum + val, 0) / confidences.length || 0;

    // Construct the narrative object
    const narrative = {
      title: 'A Keepsy Memory Narrative',
      summary: `A narrative of ${chapters.length} chapters covering the captured memories.`,
      timeline: 'Sequential chapters', // Placeholder timeline
      chapters,
      dominantJourney: 'A journey through memories',
      keyMoments,
      emotionalProgression,
      confidence: parseFloat(avgConfidence.toFixed(2)) // keep two decimal places
    };

    context.narrative = narrative;
  } catch (error) {
    console.error('Narrative generation failed:', error);
    context.narrative = null;
    context.diagnostics.errors.push({
      stage: 'narrativeGeneration',
      message: 'Narrative generation failed, setting null narrative',
      detail: error.message,
      timestamp: new Date().toISOString()
    });
  }
}