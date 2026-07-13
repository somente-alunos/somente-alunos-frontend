/**
 * Copia o bundle do @iframe-resizer/child para dentro de public/.
 *
 * O iframe do visualizador roda com sandbox="allow-scripts", ou seja, origem opaca:
 * o parent nao consegue mais ler contentDocument e a altura passa a vir por postMessage.
 * Para isso o script child precisa estar servido pela nossa origem, ja que o documento
 * do iframe e um blob: e nao resolve caminhos relativos.
 */

import { access, copyFile, mkdir } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const Const_currentDirectory = dirname(fileURLToPath(import.meta.url))
const Const_projectRoot = resolve(Const_currentDirectory, "..")

const Const_sourcePath = resolve(Const_projectRoot, "node_modules/@iframe-resizer/child/index.umd.js")
const Const_targetPath = resolve(Const_projectRoot, "public/vendor/iframe-resizer-child.js")

try {
	await access(Const_sourcePath)
}
catch {
	// A copia ja versionada em public/ continua valendo, entao nao quebramos o install.
	console.warn("[iframe-resizer] @iframe-resizer/child nao encontrado, mantendo a copia atual de public/vendor.")
	process.exit(0)
}

await mkdir(dirname(Const_targetPath), { recursive: true })
await copyFile(Const_sourcePath, Const_targetPath)

console.log(`[iframe-resizer] child copiado para ${Const_targetPath}`)
