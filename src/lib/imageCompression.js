import imageCompression from 'browser-image-compression'

/**
 * Compresses an image file if it exceeds the max size.
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @param {number} options.maxSizeMB - Maximum file size in MB (default: 2)
 * @param {number} options.maxWidthOrHeight - Max width or height in pixels (default: 1920)
 * @param {boolean} options.useWebWorker - Use web worker for better performance (default: true)
 * @returns {Promise<File>} - Returns compressed file or original if already small enough
 */
export async function compressImageIfNeeded(file, options = {}) {
  const {
    maxSizeMB = 2,
    maxWidthOrHeight = 1920,
    useWebWorker = true,
    initialQuality = 0.85,
  } = options

  // Check if file is an image
  if (!file.type.startsWith('image/')) {
    console.warn('[Image Compression] File is not an image, skipping compression')
    return file
  }

  // Get file size in MB
  const fileSizeMB = file.size / 1024 / 1024

  // If file is already small enough, return original
  if (fileSizeMB <= maxSizeMB) {
    console.log(`[Image Compression] File size (${fileSizeMB.toFixed(2)}MB) is within limit (${maxSizeMB}MB), skipping compression`)
    return file
  }

  console.log(`[Image Compression] File size (${fileSizeMB.toFixed(2)}MB) exceeds limit (${maxSizeMB}MB), compressing...`)

  try {
    const compressionOptions = {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker,
      initialQuality,
      fileType: file.type,
    }

    const compressedFile = await imageCompression(file, compressionOptions)
    const compressedSizeMB = compressedFile.size / 1024 / 1024

    console.log(
      `[Image Compression] Compressed from ${fileSizeMB.toFixed(2)}MB to ${compressedSizeMB.toFixed(2)}MB (${((1 - compressedSizeMB / fileSizeMB) * 100).toFixed(1)}% reduction)`
    )

    return compressedFile
  } catch (error) {
    console.error('[Image Compression] Compression failed, using original file:', error)
    return file
  }
}

/**
 * Compress multiple images in parallel
 * @param {File[]} files - Array of image files
 * @param {Object} options - Compression options (same as compressImageIfNeeded)
 * @returns {Promise<File[]>} - Array of compressed files
 */
export async function compressMultipleImages(files, options = {}) {
  return Promise.all(files.map(file => compressImageIfNeeded(file, options)))
}
