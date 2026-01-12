import type { TemplateFunction, TemplateId } from '../types.js'
import { branded } from './branded.js'
import { docs } from './docs.js'
import { minimal } from './minimal.js'
import { editorDark } from './editor-dark.js'

export const templates: Record<TemplateId, TemplateFunction> = {
  branded,
  docs,
  minimal,
  'editor-dark': editorDark,
}

export { branded, docs, minimal, editorDark }
