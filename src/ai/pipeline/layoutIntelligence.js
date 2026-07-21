// src/ai/pipeline/layoutIntelligence.js
// Takes clusters, affect, narrative, and creative direction and returns a layout plan.

import { layoutSchema } from '../schemas/layout.schema.js'; // imported for reference; we won't validate at runtime to avoid overhead

/**
 * Generate layout intelligence from clusters, affect, narrative, and creative direction.
 * @param {Object} context - Shared pipeline context.
 *        Expects: context.clusters (Array<Object>), context.affect (Array<Object>),
 *                 context.narrative (Object), context.creativeDirection (Object),
 *                 context.diagnostics (optional)
 *        Writes: context.layout (Object)
 *        Also updates: context.diagnostics.errors and .warnings
 */
export async function layoutIntelligence(context) {
  // Initialize diagnostics if not present
  if (!context.diagnostics) {
    context.diagnostics = { warnings: [], errors: [] };
  }

  // Validate input
  if (!context ||
      !Array.isArray(context.clusters) ||
      !Array.isArray(context.affect) ||
      !context.narrative ||
      !context.creativeDirection) {
    context.layout = null;
    context.diagnostics.errors.push({
      stage: 'layoutIntelligence',
      message: 'Invalid or missing input: clusters, affect, narrative, or creativeDirection',
      timestamp: new Date().toISOString()
    });
    return;
  }

  try {
    const { clusters, affect, narrative, creativeDirection } = context;
    const pages = [];

    // Helper to generate a deterministic ID based on seed
    function generateId(seed) {
      let hash = 0;
      for (let i = 0; i < String(seed).length; i++) {
        const char = String(seed).charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      // Convert to hex string
      let hex = Math.abs(hash).toString(16);
      // Ensure we have enough characters, pad with zeros if needed, then take first 32 chars
      while (hex.length < 32) {
        hex = '0' + hex;
      }
      hex = hex.substring(0, 32);
      return `${hex.substring(0,8)}-${hex.substring(8,12)}-${hex.substring(12,16)}-${hex.substring(16,20)}-${hex.substring(20,32)}`;
    }

    // Page dimensions (in arbitrary units, e.g., pixels)
    const PAGE_WIDTH = 800;
    const PAGE_HEIGHT = 1000;

    // Process each cluster as a page (one chapter per page)
    for (let i = 0; i < clusters.length; i++) {
      const cluster = clusters[i];
      const aff = affect[i] || {}; // affect for this cluster, if available
      const chapter = (Array.isArray(narrative.chapters) && i < narrative.chapters.length && narrative.chapters[i]) || { title: `Chapter ${i+1}`, summary: 'No summary' };

      // Generate IDs
      const pageId = generateId(i + 1000); // seed to avoid zero
      const chapterId = cluster.clusterId || generateId(i + 2000); // fallback

      // Determine layout type based on visualRhythm from creativeDirection
      const vr = creativeDirection.visualRhythm || 'steady';
      let layoutType = 'grid';
      switch (vr) {
        case 'dynamic': layoutType = 'horizontal'; break;
        case 'rhythmic': layoutType = 'masonry'; break;
        case 'staccato': layoutType = 'vertical'; break;
        case 'flowing': layoutType = 'grid'; break;
        default: layoutType = 'grid';
      }

      // Orientation: we'll use portrait; could be based on something else
      const orientation = 'portrait';

      // Whitespace from creativeDirection (0-1)
      const whitespace = creativeDirection.whitespace || 0.5;
      const padding = Math.round(whitespace * 100); // 0-100 pixels padding

      // Content area
      const contentWidth = PAGE_WIDTH - 2 * padding;
      const contentHeight = PAGE_HEIGHT - 2 * padding;

      // Background
      let background = { type: 'solid', color: '#ffffff' }; // default
      const bgStyle = creativeDirection.backgroundStyle || 'solid';
      switch (bgStyle) {
        case 'solid':
          background = { type: 'solid', color: creativeDirection.colorPalette?.[0] || '#ffffff' };
          break;
        case 'gradient':
          // Simple gradient: from first to second color
          background = {
            type: 'gradient',
            color: creativeDirection.colorPalette?.[0] || '#ffffff',
            gradient: {
              type: 'linear',
              angle: 90,
              stops: [
                { offset: '0%', color: creativeDirection.colorPalette?.[0] || '#ffffff' },
                { offset: '100%', color: creativeDirection.colorPalette?.[1] || '#000000' }
              ]
            }
          };
          break;
        case 'patterned':
        case 'textured':
          background = { type: 'patterned', pattern: 'dots' };
          break;
        case 'image':
          background = { type: 'image', image: 'placeholder' };
          break;
        default:
          background = { type: 'solid', color: creativeDirection.colorPalette?.[0] || '#ffffff' };
      }

      // Photo slots
      const memories = cluster.memories || [];
      const photoSlots = [];

      if (memories.length > 0) {
        // Determine grid dimensions
        let cols = Math.min(3, memories.length); // max 3 columns
        if (memories.length <= 2) {
          cols = memories.length;
        }
        const rows = Math.ceil(memories.length / cols);

        // Calculate cell size with some spacing
        const hSpacing = 20; // horizontal spacing between cells
        const vSpacing = 20; // vertical spacing between cells
        const cellWidth = (contentWidth - (cols + 1) * hSpacing) / cols;
        const cellHeight = (contentHeight - (rows + 1) * vSpacing) / rows;

        // Ensure minimum size
        const minSize = 50;
        const finalCellWidth = Math.max(cellWidth, minSize);
        const finalCellHeight = Math.max(cellHeight, minSize);

        // We'll center the grid
        const startX = padding + (contentWidth - (cols * finalCellWidth + (cols - 1) * hSpacing)) / 2;
        const startY = padding + 100; // leave space for title at top

        memories.forEach((mem, memIndex) => {
          const row = Math.floor(memIndex / cols);
          const col = memIndex % cols;

          const x = startX + col * (finalCellWidth + hSpacing);
          const y = startY + row * (finalCellHeight + vSpacing);

          // Generate memory ID: combine cluster index and memory index
          const memoryId = generateId(i * 1000 + memIndex);

          // Importance: use cluster confidence or memory confidence if available
          const importance = (mem.confidence !== undefined ? mem.confidence : cluster.confidence) || 0.5;

          // zIndex: higher importance -> higher zIndex, but also ensure unique
          const zIndex = Math.floor(importance * 10) + memIndex;

          // Rotation: slight variation based on index for visual interest, but deterministic
          const rotation = ((memIndex * 7) % 11) - 5; // -5 to 5 degrees

          photoSlots.push({
            memoryId,
            x: Math.round(x),
            y: Math.round(y),
            width: Math.round(finalCellWidth),
            height: Math.round(finalCellHeight),
            rotation,
            zIndex,
            importance: Math.max(0, Math.min(1, importance))
          });
        });
      }

      // Text blocks
      const textBlocks = [];
      const titleHeight = 40;
      const subtitleHeight = 30;
      const textStartX = padding;
      const textStartY = padding;

      // Title
      textBlocks.push({
        type: 'title',
        contentSource: chapter.title,
        x: textStartX,
        y: textStartY,
        width: contentWidth,
        alignment: 'center'
      });

      // Subtitle (summary)
      textBlocks.push({
        type: 'subtitle',
        contentSource: chapter.summary,
        x: textStartX,
        y: textStartY + titleHeight,
        width: contentWidth,
        alignment: 'center'
      });

      // Decorations
      const decorations = [];
      const decStyle = (creativeDirection.decorationStyle || 'playful').toLowerCase();
      // Add three decorative elements at fixed positions (corners and center)
      const decPositions = [
        { x: padding + 20, y: padding + 20 }, // top-left
        { x: padding + contentWidth - 20, y: padding + 20 }, // top-right
        { x: padding + 20, y: padding + contentHeight - 20 } // bottom-left
      ];

      decPositions.forEach((pos, idx) => {
        let type = 'dot';
        let scale = 0.5;
        let rotation = 0;

        switch (decStyle) {
          case 'playful':
            type = 'star';
            scale = 0.8;
            rotation = (idx * 30) % 360;
            break;
          case 'elegant':
            type = 'line';
            scale = 1.0;
            rotation = idx * 60;
            break;
          case 'minimal':
            type = 'dot';
            scale = 0.3;
            rotation = 0;
            break;
          case 'ornate':
            type = 'swirl';
            scale = 0.7;
            rotation = (idx * 45) % 360;
            break;
          default:
            type = 'dot';
            scale = 0.5;
            rotation = 0;
        }

        decorations.push({
          type,
          x: Math.round(pos.x),
          y: Math.round(pos.y),
          scale: parseFloat((scale * (0.8 + idx * 0.1)).toFixed(2)), // vary size slightly
          rotation
        });
      });

      // Balance assessment
      let balance = 'symmetric';
      if (layoutType === 'vertical' || layoutType === 'horizontal') {
        balance = 'asymmetric';
      } else if (layoutType === 'masonry') {
        balance = 'radial';
      }

      // Confidence: combine cluster confidence and creative direction confidence
      const confCluster = cluster.confidence || 0.5;
      const confDir = creativeDirection.confidence || 0.5;
      const confidence = (confCluster + confDir) / 2;

      // Build page object
      const page = {
        pageId,
        chapterId,
        layoutType,
        orientation,
        photoSlots,
        textBlocks,
        decorations,
        background,
        whitespace: parseFloat(whitespace.toFixed(2)),
        balance,
        confidence: parseFloat(confidence.toFixed(2))
      };

      pages.push(page);
    }

    // If no pages, create a default empty page
    if (pages.length === 0) {
      const pageId = generateId(9999);
      pages.push({
        pageId,
        chapterId: 'none',
        layoutType: 'vertical',
        orientation: 'portrait',
        photoSlots: [],
        textBlocks: [
          { type: 'title', contentSource: 'No memories', x: 0, y: 0, width: PAGE_WIDTH, alignment: 'center' }
        ],
        decorations: [],
        background: { type: 'solid', color: '#ffffff' },
        whitespace: 0.5,
        balance: 'symmetric',
        confidence: 0.1
      });
    }

    // Global flow: we'll set to sequential as we processed in order
    const globalFlow = 'sequential';

    context.layout = { pages, globalFlow };
  } catch (error) {
    console.error('Layout intelligence failed:', error);
    context.layout = null;
    context.diagnostics.errors.push({
      stage: 'layoutIntelligence',
      message: 'Layout intelligence failed, setting null layout',
      detail: error.message,
      timestamp: new Date().toISOString()
    });
  }
}