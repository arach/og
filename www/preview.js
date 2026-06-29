export function createPreviewImage(template) {
  const img = document.createElement('img')
  img.alt = `${template.id} template preview`
  img.width = 1200
  img.height = 630
  img.decoding = 'async'
  img.loading = 'lazy'

  if (import.meta.env.DEV) {
    img.src = `/api/preview/${template.id}.png?${Date.now()}`
  } else {
    img.src = template.png
  }

  return img
}