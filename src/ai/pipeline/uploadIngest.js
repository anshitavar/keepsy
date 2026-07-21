// src/ai/pipeline/uploadIngest.js
// Handles file ingestion: extracts metadata, creates thumbnails, prepares for vision analysis.

/**
 * Process files and store ingested memories in context.
 * @param {Object} context - Shared pipeline context.
 *        Expects: context.files (FileList or Array<File>), context.diagnostics (optional)
 *        Writes: context.memories (Array<Object>)
 *        Also updates: context.diagnostics.errors and .warnings
 */
export async function uploadIngest(context) {
  // Initialize diagnostics if not present
  if (!context.diagnostics) {
    context.diagnostics = { warnings: [], errors: [] };
  }

  // Validate input
  if (!context || !Array.isArray(context.files)) {
    context.memories = [];
    context.diagnostics.errors.push({
      stage: 'uploadIngest',
      message: 'Invalid or missing files in context',
      timestamp: new Date().toISOString()
    });
    return;
  }

  try {
    const files = Array.from(context.files);
    if (files.length === 0) {
      context.memories = [];
      return;
    }

    const batchSize = 5; // limit concurrent file processing to avoid overwhelming memory
    const results = [];

    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const batchPromises = batch.map(processFile);
      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error(`Failed to process file ${batch[idx].name}:`, result.reason);
          // Skip failed files but continue processing others
          context.diagnostics.errors.push({
            stage: 'uploadIngest',
            message: `Failed to process file ${batch[idx].name}`,
            detail: result.reason,
            file: batch[idx].name,
            timestamp: new Date().toISOString()
          });
        }
      });
    }

    context.memories = results;
  } catch (error) {
    console.error('Upload ingest failed:', error);
    context.memories = []; // Ensure we have a value on error
    context.diagnostics.errors.push({
      stage: 'uploadIngest',
      message: 'Unexpected error during upload ingest',
      detail: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Attempt to extract EXIF data from an image file.
 * This is a simplified mock; in production use a library like piexifjs.
 * @param {File} file - Image file.
 * @returns {Promise<Object>} EXIF-like metadata.
 */
async function extractEXIF(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        // Mock EXIF – real implementation would parse the array buffer.
        const exif = {
          timestamp: file.lastModifiedDate ? file.lastModifiedDate.toISOString() : new Date().toISOString(),
          gps: null, // Would require actual GPS data
          cameraModel: 'Unknown Camera',
          orientation: 1 // Normal orientation
        };
        resolve(exif);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = (e) => reject(e);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Create a thumbnail (data URL) for an image file.
 * @param {File} file - Image file.
 * @param {number} maxSize - Maximum dimension for thumbnail (default 256px).
 * @returns {Promise<string>} Data URL of the thumbnail.
 */
async function createThumbnail(file, maxSize = 256) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      const width = img.width * scale;
      const height = img.height * scale;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = (e) => reject(e);
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Process a single uploaded file into an ingested memory object.
 * @param {File} file - File from input element.
 * @returns {Promise<Object>} Ingested memory.
 */
async function processFile(file) {
  // Validate file type (we only process images and videos for now)
  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    throw new Error(`Unsupported file type: ${file.type}`);
  }

  const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`; // fallback for older browsers

  // Default EXIF-like metadata
  let exif = {
    timestamp: file.lastModifiedDate ? file.lastModifiedDate.toISOString() : new Date().toISOString(),
    gps: null,
    cameraModel: null,
    orientation: 1
  };

  // Extract EXIF for images
  if (file.type.startsWith('image/')) {
    try {
      exif = await extractEXIF(file);
    } catch (e) {
      console.warn('EXIF extraction failed, using fallback:', e);
      // Keep default exif
    }
  }

  // Determine dimensions (for images) – we need to wait for image load
  let dimensions = { width: 0, height: 0 };
  let duration = null;

  if (file.type.startsWith('image/')) {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise((resolve, reject) => {
      img.onload = () => {
        dimensions = { width: img.width, height: img.height };
        URL.revokeObjectURL(img.src);
        resolve();
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(img.src);
        reject(e);
      };
    });
  } else {
    // For video, we could extract duration; placeholder for now.
    duration = 0;
  }

  // Create thumbnail (for images we use a scaled thumbnail; for non-images we fallback to object URL)
  let thumbnailUrl = '';
  try {
    thumbnailUrl = await createThumbnail(file);
  } catch (e) {
    console.warn('Thumbnail creation failed, falling back to object URL:', e);
    thumbnailUrl = URL.createObjectURL(file);
  }

  return {
    id,
    originalFile: file, // keep reference for later use (e.g., uploading)
    mimeType: file.type,
    exif,
    dimensions,
    thumbnailUrl,
    duration,
    userTags: [] // placeholder for future user‑provided tags
  };
}