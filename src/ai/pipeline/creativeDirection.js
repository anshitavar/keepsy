// src/ai/pipeline/creativeDirection.js
// Takes clusters, affect, and narrative and returns creative direction.

import { creativeDirectionSchema } from '../schemas/creativeDirection.schema.js'; // imported for reference; we won't validate at runtime to avoid overhead

/**
 * Generate creative direction from clusters, affect, and narrative.
 * @param {Object} context - Shared pipeline context.
 *        Expects: context.clusters (Array<Object>), context.affect (Array<Object>), context.narrative (Object), context.diagnostics (optional)
 *        Writes: context.creativeDirection (Object)
 *        Also updates: context.diagnostics.errors and .warnings
 */
export async function creativeDirection(context) {
  // Initialize diagnostics if not present
  if (!context.diagnostics) {
    context.diagnostics = { warnings: [], errors: [] };
  }

  // Validate input
  if (!context ||
      !Array.isArray(context.clusters) ||
      !Array.isArray(context.affect) ||
      !context.narrative) {
    context.creativeDirection = null;
    context.diagnostics.errors.push({
      stage: 'creativeDirection',
      message: 'Invalid or missing input: clusters, affect, or narrative',
      timestamp: new Date().toISOString()
    });
    return;
  }

  try {
    // We'll derive creative direction from the narrative and affective data.
    // For simplicity, we'll use a deterministic mapping based on the narrative's dominant journey and emotional progression.
    // In a real implementation, this would be more sophisticated.

    // Extract key information from narrative
    const { dominantJourney, emotionalProgression, confidence: narrativeConfidence } = context.narrative;

    // Determine theme based on dominantJourney (simplified mapping)
    let theme = 'Golden little things'; // default
    if (dominantJourney) {
      const lowerJourney = dominantJourney.toLowerCase();
      if (lowerJourney.includes('struggle') || lowerJourney.includes('challenge')) {
        theme = 'After-dark together';
      } else if (lowerJourney.includes('journey') || lowerJourney.includes('travel')) {
        theme = 'The long way home';
      } else if (lowerJourney.includes('celebration') || lowerJourney.includes('joy')) {
        theme = 'Golden little things';
      } else {
        theme = 'Golden little things';
      }
    }

    // Determine artStyle based on emotionalProgression (first emotion)
    const firstEmotion = emotionalProgression[0] || 'neutral';
    let artStyle = 'modern'; // default
    switch (firstEmotion) {
      case 'joy':
      case 'excitement':
        artStyle = 'photographic';
        break;
      case 'nostalgia':
      case 'serenity':
        artStyle = 'vintage';
        break;
      case 'wonder':
      case 'tenderness':
        artStyle = 'illustrative';
        break;
      case 'pride':
      case 'amusement':
        artStyle = 'collage';
        break;
      default:
        artStyle = 'modern';
    }

    // Determine colorPalette based on artStyle and emotionalProgression
    let colorPalette = ['#FF6D86', '#FFC857', '#75CFBD', '#9A7BD3']; // default palette from original
    switch (artStyle) {
      case 'vintage':
        colorPalette = ['#8B4513', '#A0522D', '#CD853F', '#DEB887'];
        break;
      case 'watercolor':
        colorPalette = ['#ADD8E6', '#90EE90', '#FFB6C1', '#FFFFE0'];
        break;
      case 'modern':
        colorPalette = ['#000000', '#FFFFFF', '#808080', '#FF0000'];
        break;
      case 'collage':
        colorPalette = ['#FF1493', '#00FF00', '#0000FF', '#FFFF00'];
        break;
      default:
        // Keep default
    }

    // Determine paperTexture based on artStyle
    let paperTexture = 'cotton'; // default
    switch (artStyle) {
      case 'vintage':
        paperTexture = 'recycled';
        break;
      case 'watercolor':
        paperTexture = 'textured';
        break;
      case 'modern':
        paperTexture = 'matte';
        break;
      case 'collage':
        paperTexture = 'recycled';
        break;
      default:
    }

    // Determine photoTreatment based on emotionalProgression
    let photoTreatment = 'vibrant'; // default
    const dominantEmotion = emotionalProgression.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {});
    
    const emotionKeys = Object.keys(dominantEmotion);
    const mostFrequentEmotion = emotionKeys.length > 0
      ? emotionKeys.reduce((a, b) => dominantEmotion[a] > dominantEmotion[b] ? a : b)
      : 'neutral';

    switch (mostFrequentEmotion) {
      case 'joy':
      case 'excitement':
        photoTreatment = 'vibrant';
        break;
      case 'nostalgia':
        photoTreatment = 'sepia';
        break;
      case 'serenity':
      case 'calm':
        photoTreatment = 'matte';
        break;
      case 'wonder':
        photoTreatment = 'filtered';
        break;
      default:
        photoTreatment = 'vibrant';
    }

    // Determine decorationStyle based on artStyle
    let decorationStyle = 'playful'; // default
    switch (artStyle) {
      case 'vintage':
        decorationStyle = 'ornate';
        break;
      case 'watercolor':
        decorationStyle = 'delicate';
        break;
      case 'modern':
        decorationStyle = 'minimal';
        break;
      case 'collage':
        decorationStyle = 'eclectic';
        break;
      default:
        decorationStyle = 'playful';
    }

    // Determine backgroundStyle based on colorPalette complexity
    let backgroundStyle = 'solid'; // default
    if (colorPalette.length > 2) {
      backgroundStyle = 'gradient';
    }
    if (artStyle === 'watercolor') {
      backgroundStyle = 'textured';
    }

    // Determine typography based on artStyle
    let headingFont = 'sans-serif';
    let bodyFont = 'sans-serif';
    let fontSize = '12pt';
    switch (artStyle) {
      case 'vintage':
        headingFont = 'serif';
        bodyFont = 'serif';
        break;
      case 'watercolor':
        headingFont = 'script';
        bodyFont = 'serif';
        break;
      case 'modern':
        headingFont = 'sans-serif';
        bodyFont = 'sans-serif';
        break;
      case 'collage':
        headingFont = 'display';
        bodyFont = 'sans-serif';
        break;
      default:
    }

    // Determine pageMood based on emotionalProgression (average)
    const moodMap = {
      joy: 'joyful',
      contentment: 'peaceful',
      nostalgia: 'nostalgic',
      excitement: 'energetic',
      serenity: 'calm',
      wonder: 'whimsical',
      tenderness: 'peaceful',
      pride: 'confident',
      amusement: 'playful',
      neutral: 'calm'
    };
    const moodCounts = emotionalProgression.reduce((acc, emotion) => {
      const mood = moodMap[emotion] || 'calm';
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {});
    let pageMood = 'calm'; // default
    if (Object.keys(moodCounts).length > 0) {
      pageMood = Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b);
    }

    // Determine transitionStyle based on visualRhythm (we'll set visualRhythm first)
    let visualRhythm = 'steady'; // default
    switch (pageMood) {
      case 'energetic':
        visualRhythm = 'dynamic';
        break;
      case 'playful':
        visualRhythm = 'rhythmic';
        break;
      case 'whimsical':
        visualRhythm = 'staccato';
        break;
      case 'peaceful':
      case 'calm':
        visualRhythm = 'steady';
        break;
      default:
        visualRhythm = 'steady';
    }
    let transitionStyle = 'fade'; // default
    switch (visualRhythm) {
      case 'dynamic':
        transitionStyle = 'slide';
        break;
      case 'rhythmic':
        transitionStyle = 'fade';
        break;
      case 'staccato':
        transitionStyle = 'zoom';
        break;
      default:
        transitionStyle = 'fade';
    }

    // Determine density and whitespace based on decorationStyle and artStyle
    let density = 0.5; // default
    let whitespace = 0.5; // default
    switch (decorationStyle) {
      case 'minimal':
        density = 0.3;
        whitespace = 0.7;
        break;
      case 'ornate':
        density = 0.7;
        whitespace = 0.3;
        break;
      case 'playful':
        density = 0.6;
        whitespace = 0.4;
        break;
      case 'elegant':
        density = 0.5;
        whitespace = 0.5;
        break;
      default:
        density = 0.5;
        whitespace = 0.5;
    }

    // Adjust based on artStyle
    if (artStyle === 'collage') {
      density = Math.min(1, density + 0.2);
      whitespace = Math.max(0, whitespace - 0.2);
    } else if (artStyle === 'minimal') {
      density = Math.max(0, density - 0.2);
      whitespace = Math.min(1, whitespace + 0.2);
    }

    // Overall confidence: average of narrative confidence and some heuristic
    const confidence = (narrativeConfidence + 0.8) / 2; // blend narrative confidence with a base confidence

    // Build the creative direction object
    const direction = {
      theme,
      artStyle,
      colorPalette,
      paperTexture,
      photoTreatment,
      decorationStyle,
      backgroundStyle,
      typography: {
        headingFont,
        bodyFont,
        fontSize
      },
      pageMood,
      transitionStyle,
      visualRhythm,
      density,
      whitespace,
      confidence: Math.max(0, Math.min(1, confidence)) // clamp
    };

    context.creativeDirection = direction;
  } catch (error) {
    console.error('Creative direction failed:', error);
    context.creativeDirection = null;
    context.diagnostics.errors.push({
      stage: 'creativeDirection',
      message: 'Creative direction failed, setting null',
      detail: error.message,
      timestamp: new Date().toISOString()
    });
  }
}