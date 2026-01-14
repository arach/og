import { execSync } from 'node:child_process'
import { readFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'

export interface SetupAnalysis {
  isReact: boolean
  isNextJs: boolean
  isVite: boolean
  hasHelmet: boolean
  hasExistingOgTags: boolean
  recommendHelmet: boolean
  metaTagsLocation: string | null
  installCommand: string | null
  metaTags: string
  instructions: string[]
}

interface ProjectContext {
  packageJson: Record<string, unknown> | null
  hasAppRouter: boolean
  hasPagesRouter: boolean
  hasIndexHtml: boolean
  layoutFiles: string[]
  ogImagePath: string
}

async function gatherContext(ogImagePath: string): Promise<ProjectContext> {
  const context: ProjectContext = {
    packageJson: null,
    hasAppRouter: false,
    hasPagesRouter: false,
    hasIndexHtml: false,
    layoutFiles: [],
    ogImagePath
  }

  // Read package.json
  try {
    const pkg = await readFile('package.json', 'utf-8')
    context.packageJson = JSON.parse(pkg)
  } catch {
    // No package.json
  }

  // Check for Next.js app router
  context.hasAppRouter = existsSync('app') || existsSync('src/app')
  context.hasPagesRouter = existsSync('pages') || existsSync('src/pages')

  // Check for index.html (Vite, CRA, plain HTML)
  context.hasIndexHtml = existsSync('index.html') || existsSync('public/index.html')

  // Find layout files
  const layoutPatterns = [
    'app/layout.tsx', 'app/layout.jsx', 'app/layout.js',
    'src/app/layout.tsx', 'src/app/layout.jsx', 'src/app/layout.js',
    'pages/_app.tsx', 'pages/_app.jsx', 'pages/_app.js',
    'src/pages/_app.tsx', 'src/pages/_app.jsx', 'src/pages/_app.js',
    'src/App.tsx', 'src/App.jsx', 'src/App.js',
    'src/main.tsx', 'src/main.jsx', 'src/main.js'
  ]

  for (const pattern of layoutPatterns) {
    if (existsSync(pattern)) {
      context.layoutFiles.push(pattern)
    }
  }

  return context
}

function buildPrompt(context: ProjectContext): string {
  const contextJson = JSON.stringify(context, null, 2)

  return `Analyze this project and help set up OG meta tags for the image at "${context.ogImagePath}".

PROJECT CONTEXT:
${contextJson}

Respond with ONLY valid JSON matching this exact structure (no markdown, no explanation, just JSON):

{
  "isReact": boolean,
  "isNextJs": boolean,
  "isVite": boolean,
  "hasHelmet": boolean,
  "hasExistingOgTags": boolean,
  "recommendHelmet": boolean,
  "metaTagsLocation": "path/to/file or null if unclear",
  "installCommand": "pnpm add react-helmet-async" or null if not needed,
  "metaTags": "the actual code snippet to add (HTML meta tags or React/Next.js code)",
  "instructions": ["step 1", "step 2", ...]
}

Rules:
- isReact: true if React is a dependency
- isNextJs: true if Next.js project (next in dependencies)
- isVite: true if Vite project (vite in devDependencies)
- hasHelmet: true if react-helmet or react-helmet-async is installed
- recommendHelmet: true if React (not Next.js) and no helmet installed
- For Next.js App Router: use generateMetadata or metadata export
- For Next.js Pages Router: use next/head
- For React+Vite: use react-helmet-async
- For plain HTML: just the meta tags
- metaTags should be copy-pasteable code
- instructions should be clear, actionable steps`
}

export async function runSetup(ogImagePath: string = 'og.png'): Promise<SetupAnalysis | null> {
  console.log(`\n  Analyzing project for OG setup...\n`)

  const context = await gatherContext(ogImagePath)

  // Find claude CLI - prefer ~/.claude/local/claude
  const homedir = process.env.HOME || process.env.USERPROFILE || ''
  const claudePaths = [
    `${homedir}/.claude/local/claude`,
    'claude' // fallback to PATH
  ]

  let claudePath: string | null = null
  for (const p of claudePaths) {
    try {
      execSync(`${p} --version`, { encoding: 'utf-8', stdio: 'pipe' })
      claudePath = p
      break
    } catch {
      // Try next
    }
  }

  if (!claudePath) {
    console.log(`  Claude Code CLI not found. Install it or use manual setup.\n`)
    printFallbackInstructions(ogImagePath)
    return null
  }

  const prompt = buildPrompt(context)

  console.log(`  Running analysis with Claude Code...\n`)

  try {
    // Shell out to claude -p using stdin to avoid shell escaping issues
    const result = execSync(`${claudePath} -p -`, {
      encoding: 'utf-8',
      input: prompt,
      stdio: ['pipe', 'pipe', 'pipe'],
      maxBuffer: 1024 * 1024
    })

    // Parse the JSON response
    const jsonMatch = result.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.log(`  Could not parse response. Raw output:\n`)
      console.log(result)
      return null
    }

    const analysis: SetupAnalysis = JSON.parse(jsonMatch[0])
    printAnalysis(analysis)
    return analysis

  } catch (error) {
    const err = error as Error & { stderr?: string; stdout?: string }
    console.log(`  Claude analysis failed. Using fallback.`)
    if (err.stderr) console.log(`  Error: ${err.stderr.slice(0, 200)}`)
    console.log()
    printFallbackInstructions(ogImagePath)
    return null
  }
}

function printAnalysis(analysis: SetupAnalysis): void {
  const check = '\x1b[32m✓\x1b[0m'
  const cross = '\x1b[31m✗\x1b[0m'
  const info = '\x1b[36mℹ\x1b[0m'

  console.log(`  Project Analysis`)
  console.log(`  ${'─'.repeat(40)}`)
  console.log(`  ${analysis.isNextJs ? check : cross} Next.js`)
  console.log(`  ${analysis.isReact ? check : cross} React`)
  console.log(`  ${analysis.isVite ? check : cross} Vite`)
  console.log(`  ${analysis.hasHelmet ? check : cross} Helmet installed`)
  console.log(`  ${analysis.hasExistingOgTags ? check : cross} Existing OG tags`)

  if (analysis.recommendHelmet && analysis.installCommand) {
    console.log(`\n  ${info} Recommended: Install helmet for meta tag management`)
    console.log(`\n    ${analysis.installCommand}\n`)
  }

  if (analysis.metaTagsLocation) {
    console.log(`\n  ${info} Add to: ${analysis.metaTagsLocation}`)
  }

  console.log(`\n  ${'─'.repeat(40)}`)
  console.log(`  Code to add:`)
  console.log(`  ${'─'.repeat(40)}\n`)
  console.log(analysis.metaTags)
  console.log(`\n  ${'─'.repeat(40)}`)

  if (analysis.instructions.length > 0) {
    console.log(`\n  Steps:`)
    analysis.instructions.forEach((step, i) => {
      console.log(`    ${i + 1}. ${step}`)
    })
  }

  console.log()
}

function printFallbackInstructions(ogImagePath: string): void {
  console.log(`  Add these meta tags to your HTML <head>:\n`)
  console.log(`    <meta property="og:image" content="https://yoursite.com/${ogImagePath}" />`)
  console.log(`    <meta property="og:image:width" content="1200" />`)
  console.log(`    <meta property="og:image:height" content="630" />`)
  console.log(`    <meta property="og:type" content="website" />\n`)

  console.log(`  For React projects, consider react-helmet-async:`)
  console.log(`    pnpm add react-helmet-async\n`)

  console.log(`  For Next.js App Router, export metadata from layout.tsx:`)
  console.log(`    export const metadata = {`)
  console.log(`      openGraph: { images: ['/og.png'] }`)
  console.log(`    }\n`)
}
