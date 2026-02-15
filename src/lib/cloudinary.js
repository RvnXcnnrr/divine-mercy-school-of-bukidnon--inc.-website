const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

if (!cloudName || !uploadPreset) {
  console.warn('[Cloudinary] Missing VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET. Image uploads will be disabled until set.')
}

export function buildCloudinaryUrl(publicId, options = {}) {
  if (!publicId) return ''
  const { width, height, crop = 'fill', quality = 'auto', format = 'auto' } = options
  const transforms = [`f_${format}`, `q_${quality}`]
  if (width) transforms.push(`w_${width}`)
  if (height) transforms.push(`h_${height}`)
  if (crop) transforms.push(`c_${crop}`)
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms.join(',')}/${publicId}`
}

export async function uploadImageToCloudinary(file, { folder = 'uploads', onProgress } = {}) {
  if (!cloudName || !uploadPreset) throw new Error('Cloudinary env not configured')
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', folder)
  formData.append('context', 'photo=school-site')

  const controller = new AbortController()
  const xhr = new XMLHttpRequest()

  const promise = new Promise((resolve, reject) => {
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100)
        onProgress(percent)
      }
    }
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            resolve({
              secureUrl: response.secure_url,
              publicId: response.public_id,
              width: response.width,
              height: response.height,
            })
          } catch (err) {
            reject(err)
          }
        } else {
          reject(new Error(`Cloudinary upload failed (${xhr.status})`))
        }
      }
    }
    xhr.onerror = () => reject(new Error('Cloudinary upload failed'))
    xhr.onabort = () => reject(new Error('Cloudinary upload aborted'))
    xhr.open('POST', url)
    xhr.send(formData)
  })

  promise.cancel = () => controller.abort()
  return promise
}
