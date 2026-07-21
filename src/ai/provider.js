// src/ai/provider.js
// Abstract base class for vision providers

export class VisionProvider {
  /**
   * Analyze a single image and return structured understanding.
   * @param {string} imageUrl - URL or data URI of the image.
   * @returns {Promise<Object>} Vision understanding result.
   */
  async analyzeImage(imageUrl) {
    throw new Error('analyzeImage method must be implemented by subclass');
  }

  /**
   * Analyze multiple images.
   * @param {Array<string>} imageUrls - Array of image URLs/data URIs.
   * @returns {Promise<Array<Object>>} Array of vision understanding results.
   */
  async analyzeImages(imageUrls) {
    // Default implementation: process in parallel
    return Promise.all(imageUrls.map(url => this.analyzeImage(url)));
  }
}