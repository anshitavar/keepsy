// src/ai/providers/nvidiaProvider.js
// Mock implementation of NVIDIA vision provider.
// In production, replace the mock with actual API calls.

import { VisionProvider } from '../provider.js';

export class NVIDIAProvider extends VisionProvider {
  /**
   * Analyze a single image using NVIDIA's API (mocked).
   * @param {string} imageUrl - URL or data URI of the image.
   * @returns {Promise<Object>} Structured vision understanding.
   */
  async analyzeImage(imageUrl) {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Return a realistic-looking mock response that matches the vision schema.
      return this._generateMockResponse(imageUrl);
    } catch (error) {
      console.error('NVIDIA Provider error:', error);
      // Return a safe fallback to keep the pipeline alive.
      return this._getFallbackResponse();
    }
  }

  /**
   * Generate a deterministic mock response based on the image URL.
   * This ensures the same image yields the same mock analysis.
   * @param {string} imageUrl
   * @returns {Object}
   */
  _generateMockResponse(imageUrl) {
    // Create a deterministic seed from the image URL
    let seed = 0;
    for (let i = 0; i < imageUrl.length; i++) {
      seed = (seed * 31 + imageUrl.charCodeAt(i)) % 1000;
    }

    // Predefined mock data sets
    const scenes = [
      'a group of people smiling at a birthday party',
      'a serene landscape with mountains and a lake',
      'a close-up of delicious food on a wooden table',
      'a city street during golden hour with pedestrians',
      'a cozy indoor scene with warm lighting and books',
      'a beach vacation scene with ocean and palm trees',
      'a festive holiday gathering with decorations',
      'a sports action shot of athletes in motion',
      'a peaceful garden with flowers and butterflies',
      'a vintage car parked on a quiet street'
    ];

    const objectsLists = [
      ['person', 'smile', 'cake', 'balloon', 'gift'],
      ['mountain', 'lake', 'tree', 'sky', 'water'],
      ['food', 'plate', 'fork', 'knife', 'table', 'wine glass'],
      ['building', 'street', 'car', 'person', 'sky'],
      ['book', 'chair', 'lamp', 'window', 'plant'],
      ['ocean', 'beach', 'palm tree', 'sun', 'sand'],
      ['tree', 'light', 'decoration', 'gift', 'family'],
      ['person', 'ball', 'sport', 'motion', 'stadium'],
      ['flower', 'butterfly', 'grass', 'sky', 'path'],
      ['car', 'street', 'building', 'sky', 'wheel']
    ];

    const palettes = [
      ['#ff6d86', '#ffc857', '#75cfbd', '#9a7bd3'], // Golden little things
      ['#773d86', '#ff6b7a', '#f7c857', '#304b82'], // After-dark together
      ['#527a82', '#d88d54', '#f2d399', '#8fa574']  // The long way home
    ];

    const weatherOptions = ['sunny', 'cloudy', 'rainy', 'snowy', 'foggy', 'clear'];
    const timeOptions = ['dawn', 'morning', 'afternoon', 'dusk', 'night'];
    const emotionOptions = ['joy', 'contentment', 'nostalgia', 'excitement', 'serenity', 'wonder'];
    const lightingOptions = ['bright', 'dim', 'backlit', 'golden_hour', 'fluorescent', 'mixed'];

    const sceneIndex = seed % scenes.length;
    const objects = objectsLists[sceneIndex % objectsLists.length].map((label, i) => ({
      label,
      confidence: 0.8 + (Math.sin(seed + i) * 0.1), // deterministic variation
      boundingBox: {
        x: 0.1 + (i * 0.15),
        y: 0.1 + (i * 0.1),
        width: 0.2,
        height: 0.2
      },
      attributes: {}
    }));

    return {
      sceneDescription: scenes[sceneIndex],
      objects: objects,
      actions: [
        { verb: 'smiling', subject: 'people', confidence: 0.75 },
        { verb: 'standing', subject: 'group', confidence: 0.7 }
      ],
      visualQualities: {
        dominantColors: palettes[sceneIndex % palettes.length].map(color => ({
          color,
          percentage: 25
        })),
        lighting: lightingOptions[seed % lightingOptions.length],
        composition: {
          ruleOfThirds: seed % 2 === 0,
          leadingLines: seed % 3 === 0,
          symmetry: ['horizontal', 'vertical', 'radial', 'none'][seed % 4],
          depthOfField: ['shallow', 'moderate', 'deep'][seed % 3]
        },
        motionBlur: Math.abs(Math.sin(seed)) * 0.3,
        noiseLevel: Math.abs(Math.cos(seed)) * 0.2
      },
      setting: {
        locationType: ['indoor', 'outdoor', 'urban', 'natural', 'water', 'mountain'][seed % 6],
        weather: weatherOptions[seed % weatherOptions.length],
        timeOfDay: timeOptions[seed % timeOptions.length]
      },
      emotion: emotionOptions[seed % emotionOptions.length],
      architecture: seed % 2 === 0 ? 'modern' : 'traditional',
      food: objects.some(obj => ['food', 'cake', 'meal', 'fruit', 'vegetable'].includes(obj.label.toLowerCase())),
      travel: objects.some(obj => ['beach', 'mountain', 'plane', 'hotel', 'map'].includes(obj.label.toLowerCase())),
      festival: objects.some(obj => ['decoration', 'light', 'party', 'celebration'].includes(obj.label.toLowerCase())),
      cameraStyle: seed % 2 === 0 ? 'portrait' : 'landscape',
      compositionNotes: 'Well-composed image with balanced elements',
      confidence: 0.85 + (Math.sin(seed) * 0.1) // between 0.75 and 0.95
    };
  }

  /**
   * Fallback response when the mock or real API fails.
   * @returns {Object}
   */
  _getFallbackResponse() {
    return {
      sceneDescription: 'Unable to analyze image content',
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
}