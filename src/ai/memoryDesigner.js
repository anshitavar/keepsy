// src/ai/memoryDesigner.js
// Thin compatibility layer: delegates to AI pipeline for vision understanding and memory clustering,
// then uses the scrapbook composer to create a renderer-ready scrapbook plan.
// Returns the original direction object with AI context attached as `ai` and scrapbook plan attached as `scrapbookPlan`.

// Import the deterministic helpers (we'll keep them internal)
function seedFor(files) {
  return files.reduce((seed, file) => [...file.name].reduce((n, char) => n + char.charCodeAt(0), seed), files.length * 19);
}
function random(seed) {
  const next = Math.sin(seed * 12.9898) * 43758.5453;
  return next - Math.floor(next);
}
function composeSpread(seed, pageIndex, memoryCount) {
  const words = ['caught in the moment', 'worth keeping', 'laughing again', 'the good kind of ordinary', 'one for later', 'a soft little pause'];
  const anchors = pageIndex === 0
    ? [[52, 248, 220], [274, 266, 145], [291, 454, 136]]
    : [[48, 201, 208], [263, 225, 162], [250, 447, 151]];
  return anchors.map(([baseX, baseY, baseSize], index) => {
    const n = seed + pageIndex * 31 + index * 17;
    return {
      memoryIndex: (pageIndex * 3 + index + Math.floor(random(n) * 4)) % Math.max(memoryCount, 1),
      x: Math.round(baseX + (random(n + 1) - .5) * 48),
      y: Math.round(baseY + (random(n + 2) - .5) * 56),
      width: Math.round(baseSize + (random(n + 3) - .5) * 38),
      rotation: Math.round((random(n + 4) - .5) * 20),
      caption: words[(seed + index * 3 + pageIndex) % words.length]
    };
  });
}

// Original deterministic direction builder (unchanged)
function originalBuildCreativeDirection(files = []) {
  const directions = [
    { theme: 'Golden little things', palette: ['#ff6d86', '#ffc857', '#75cfbd', '#9a7bd3'], paperTexture: 'sun-faded cotton', story: 'A bright little run of ordinary moments that became the best part of the day.', rhythm: 'playful crescendo' },
    { theme: 'After-dark together', palette: ['#773d86', '#ff6b7a', '#f7c857', '#304b82'], paperTexture: 'ink-washed paper', story: 'A night that got louder, warmer, and more unforgettable with every frame.', rhythm: 'electric celebration' },
    { theme: 'The long way home', palette: ['#527a82', '#d88d54', '#f2d399', '#8fa574'], paperTexture: 'weathered map paper', story: 'Small detours, full tables, and the kind of moving-through-the-world that stays with you.', rhythm: 'curious journey' }
  ];
  const seed = seedFor(files);
  const base = directions[seed % directions.length];
  const inferred = {
    people: Math.max(1, Math.ceil(files.length * .62)),
    energy: (seed % 2) ? 'warm, unhurried, close-knit' : 'bright, buoyant, in-motion',
    visualRhythm: base.rhythm,
    storyArc: ['a gentle opening', 'the colour and laughter builds', 'a soft note to keep'],
    colorSignals: base.palette
  };
  return {
    ...base,
    inferred,
    layoutStyle: 'one-off organic journal',
    instructions: {
      neverRepeat: true,
      density: [0.42, 0.82, 0.34],
      preserveBreathingSpace: true,
      decorationLogic: 'Select ephemera only when it strengthens the visual story.'
    },
    composition: [
      composeSpread(seed, 0, files.length),
      composeSpread(seed, 1, files.length)
    ],
    pages: [
      { section: 'opening', title: 'the little things', caption: 'slow down. this bit mattered.', density: 'airy' },
      { section: 'peak', title: 'more of this, please', caption: 'the frame where everything came alive.', density: 'layered' },
      { section: 'pause', title: 'keep this close', caption: 'a quiet ending, left intentionally open.', density: 'soft' }
    ]
  };
}

// Asynchronous enhancement
export async function buildCreativeDirection(files = []) {
  try {
    // If no files, return deterministic result (matches original behavior)
    if (!files || files.length === 0) {
      const direction = originalBuildCreativeDirection(files);
      return {
        ...direction,
        ai: {
          memories: [],
          vision: [],
          clusters: [],
          diagnostics: { warnings: [], errors: [] }
        }
      };
    }

    // Load dependencies lazily to avoid building issues if modules missing
    const { AIPipeline } = await import('./services/aiPipeline.js');
    const { NVIDIAProvider } = await import('./providers/nvidiaProvider.js');
    const { scrapbookComposer } = await import('./composer/scrapbookComposer.js');

    const pipeline = new AIPipeline();
    const provider = new NVIDIAProvider();

    // Run the full pipeline: all stages
    const context = await pipeline.processFiles(files, provider);

    // Build the direction object using the original deterministic logic
    const direction = originalBuildCreativeDirection(files);

    // Overwrite the deterministic properties with the AI-generated ones from pipeline
    if (context.creativeDirection) {
      if (context.creativeDirection.theme) direction.theme = context.creativeDirection.theme;
      if (context.creativeDirection.colorPalette) direction.palette = context.creativeDirection.colorPalette;
      if (context.creativeDirection.paperTexture) direction.paperTexture = context.creativeDirection.paperTexture;
      if (!direction.inferred) direction.inferred = {};
      if (context.creativeDirection.pageMood) direction.inferred.energy = context.creativeDirection.pageMood;
      if (context.creativeDirection.visualRhythm) direction.inferred.visualRhythm = context.creativeDirection.visualRhythm;
    }
    if (context.narrative) {
      if (context.narrative.summary) direction.story = context.narrative.summary;
      if (!direction.inferred) direction.inferred = {};
      if (context.narrative.emotionalProgression) direction.inferred.storyArc = context.narrative.emotionalProgression;
    }

    // Attach AI results (the full context) for later phases
    direction.ai = context;

    // Generate scrapbook plan from context
    const plan = await scrapbookComposer(context);
    direction.scrapbookPlan = plan;

    return direction;
  } catch (error) {
    // Fallback to original deterministic behavior if anything fails
    console.warn('AI pipeline or composer unavailable, falling back to deterministic behavior:', error);
    return originalBuildCreativeDirection(files);
  }
}