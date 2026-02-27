import { supabase } from './supabaseClient.js'
import { compressImageIfNeeded } from './imageCompression.js'

/**
 * Upload image to Supabase Storage with auto-compression
 * @param {File} file - Image file to upload
 * @param {Object} options - Upload options
 * @param {string} options.bucket - Storage bucket name (e.g., 'posts', 'faculty', 'gallery', 'avatars')
 * @param {string} options.folder - Optional subfolder within bucket
 * @param {number} options.maxSizeMB - Max size before compression (default: 2)
 * @param {number} options.maxWidthOrHeight - Max dimension in pixels (default: 1920)
 * @returns {Promise<Object>} - { publicUrl, path, fullPath }
 */
export async function uploadImageToSupabase(file, options = {}) {
  const {
    bucket = 'posts',
    folder = '',
    maxSizeMB = 2,
    maxWidthOrHeight = 1920,
  } = options

  // Auto-compress if needed
  const compressedFile = await compressImageIfNeeded(file, { maxSizeMB, maxWidthOrHeight })

  // Generate unique filename
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 15)
  const ext = compressedFile.name.split('.').pop()
  const fileName = `${timestamp}-${randomStr}.${ext}`
  const filePath = folder ? `${folder}/${fileName}` : fileName

  console.log(`[Supabase Storage] Uploading to ${bucket}/${filePath}`)

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, compressedFile, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('[Supabase Storage] Upload failed:', error)
    throw new Error(`Upload failed: ${error.message}`)
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)

  console.log(`[Supabase Storage] Upload successful: ${urlData.publicUrl}`)

  return {
    publicUrl: urlData.publicUrl,
    path: data.path,
    fullPath: data.fullPath,
  }
}

/**
 * Delete image from Supabase Storage
 * @param {string} path - File path to delete (e.g., 'folder/filename.jpg')
 * @param {string} bucket - Bucket name
 * @returns {Promise<Object>} - { success: true }
 */
export async function deleteImageFromSupabase(path, bucket = 'posts') {
  console.log(`[Supabase Storage] Deleting ${bucket}/${path}`)

  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) {
    console.error('[Supabase Storage] Delete failed:', error)
    throw new Error(`Delete failed: ${error.message}`)
  }

  console.log('[Supabase Storage] Delete successful')
  return { success: true }
}

/**
/**
 * Upload any file (PDF, DOCX, etc.) to Supabase Storage without compression.
 * @param {File} file - File to upload
 * @param {Object} options
 * @param {string} options.bucket - Storage bucket name (e.g., 'forms')
 * @param {string} options.folder - Optional subfolder within bucket
 * @returns {Promise<Object>} - { publicUrl, path, fullPath }
 */
export async function uploadFileToSupabase(file, options = {}) {
  const { bucket = 'forms', folder = '' } = options

  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 15)
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const fileName = `${timestamp}-${randomStr}-${safeName}`
  const filePath = folder ? `${folder}/${fileName}` : fileName

  console.log(`[Supabase Storage] Uploading file to ${bucket}/${filePath}`)

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'application/octet-stream',
    })

  if (error) {
    console.error('[Supabase Storage] File upload failed:', error)
    throw new Error(`Upload failed: ${error.message}`)
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)

  console.log(`[Supabase Storage] File upload successful: ${urlData.publicUrl}`)

  return {
    publicUrl: urlData.publicUrl,
    path: data.path,
    fullPath: data.fullPath,
  }
}

/**
 * Upload multiple images in parallel
 * @param {File[]} files - Array of image files
 * @param {Object} options - Upload options (same as uploadImageToSupabase)
 * @returns {Promise<Object[]>} - Array of upload results
 */
export async function uploadMultipleImages(files, options = {}) {
  console.log(`[Supabase Storage] Uploading ${files.length} images in parallel`)
  return Promise.all(files.map((file) => uploadImageToSupabase(file, options)))
}

/**
 * Get a signed URL for private files (if bucket is not public)
 * @param {string} path - File path
 * @param {string} bucket - Bucket name
 * @param {number} expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns {Promise<string>} - Signed URL
 */
export async function getSignedUrl(path, bucket = 'posts', expiresIn = 3600) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error) {
    console.error('[Supabase Storage] Failed to create signed URL:', error)
    throw new Error(`Signed URL failed: ${error.message}`)
  }

  return data.signedUrl
}

/**
 * List all files in a bucket/folder
 * @param {string} bucket - Bucket name
 * @param {string} folder - Optional folder path
 * @param {Object} options - List options
 * @param {number} options.limit - Max files to return
 * @param {number} options.offset - Pagination offset
 * @returns {Promise<Array>} - Array of file objects
 */
export async function listFiles(bucket = 'posts', folder = '', options = {}) {
  const { limit = 100, offset = 0 } = options

  const { data, error } = await supabase.storage.from(bucket).list(folder, {
    limit,
    offset,
    sortBy: { column: 'created_at', order: 'desc' },
  })

  if (error) {
    console.error('[Supabase Storage] List failed:', error)
    throw new Error(`List failed: ${error.message}`)
  }

  return data
}

/**
 * Extract path from Supabase Storage public URL
 * Useful for getting the path to delete a file
 * @param {string} url - Public URL from Supabase Storage
 * @returns {string} - File path
 */
export function extractPathFromUrl(url) {
  // URL format: https://project.supabase.co/storage/v1/object/public/bucket/path/file.jpg
  const match = url.match(/\/object\/public\/[^/]+\/(.+)/)
  return match ? match[1] : ''
}
