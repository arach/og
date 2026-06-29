export async function loadTemplateCatalog() {
  if (import.meta.env.DEV) {
    const response = await fetch('/api/catalog')
    if (!response.ok) {
      throw new Error('Failed to load template catalog')
    }
    return response.json()
  }

  const { templateCatalog } = await import('./templates.generated.js')
  return templateCatalog.map(({ id, png, description, socialTitle, config, html }) => ({
    id,
    png,
    description,
    socialTitle,
    config,
    html,
  }))
}