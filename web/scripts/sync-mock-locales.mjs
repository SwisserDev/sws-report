// Copies ../locales/*.lua into a JSON file for the browser mock (npm run dev).
// FiveM sends the real locale at runtime, this only keeps dev previews translated.
import { readFileSync, readdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = dirname(fileURLToPath(import.meta.url))
const localeDir = join(root, "..", "..", "locales")
const target = join(root, "..", "src", "lib", "mock", "locales.json")

const entry = /^\s*\["([a-z0-9_]+)"\]\s*=\s*"((?:[^"\\]|\\.)*)"/

const locales = {}
for (const file of readdirSync(localeDir).filter((f) => f.endsWith(".lua")).sort()) {
  const strings = {}
  for (const line of readFileSync(join(localeDir, file), "utf8").split(/\r?\n/)) {
    const match = line.match(entry)
    if (match) strings[match[1]] = JSON.parse(`"${match[2]}"`)
  }
  locales[file.replace(/\.lua$/, "")] = strings
}

writeFileSync(target, JSON.stringify(locales, null, 2) + "\n")
console.log(`mock locales: ${Object.keys(locales).join(", ")} -> ${target}`)
