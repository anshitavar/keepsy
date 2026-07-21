// src/ai/services/aiPipeline.js
// Orchestrates upload‑ingest → vision understanding → memory clustering → affect analysis → narrative generation → creative direction → layout intelligence.

import { uploadIngest } from '../pipeline/uploadIngest.js';
import { visionUnderstanding } from '../pipeline/visionUnderstanding.js';
import { memoryClustering } from '../pipeline/memoryClustering.js';
import { affectAnalysis } from '../pipeline/affectAnalysis.js';
import { narrativeGeneration } from '../pipeline/narrativeGeneration.js';
import { creativeDirection } from '../pipeline/creativeDirection.js';
import { layoutIntelligence } from '../pipeline/layoutIntelligence.js';

/**
 * AI Pipeline Service.
 * Decouples the vision provider from the rest of the app.
 * Now uses a context object that flows through each stage.
 */
export class AIPipeline {
  /**
   * Process a list of files through the full pipeline.
   * @param {FileList|Array<File>} fileList - Files from input element.
   * @param {VisionProvider} provider - Vision provider to use for understanding.
   * @returns {Promise<Object>} The populated context object containing:
   *          memories, vision, clusters, affect, narrative, creativeDirection, layout, diagnostics.
   */
  async processFiles(fileList, provider) {
    // Initialize context with inputs and diagnostics
    const context = {
      files: fileList,
      provider,
      diagnostics: { warnings: [], errors: [] }
    };

    // Run pipeline stages
    await uploadIngest(context);
    await visionUnderstanding(context);
    await memoryClustering(context);
    await affectAnalysis(context);
    await narrativeGeneration(context);
    await creativeDirection(context);
    await layoutIntelligence(context);

    return context;
  }

  /**
   * Convenience method for a single file.
   * @param {File} file - Single file object.
   * @param {VisionProvider} provider - Vision provider to use.
   * @returns {Promise<Object>} The populated context object for a single file.
   */
  async processFile(file, provider) {
    const context = await this.processFiles([file], provider);
    return context;
  }
}

// Export a default instance for ease of use (optional)
export const aiPipeline = new AIPipeline();