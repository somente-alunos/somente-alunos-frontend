/**
 * O visualizador roda o HTML do aluno num iframe com sandbox="allow-scripts" (origem opaca),
 * entao o parent nao consegue ler contentDocument para medir a altura. Quem mede e reporta a
 * altura por postMessage e o child do iframe-resizer, que precisa ser injetado no proprio HTML.
 */

const Const_iframeResizerChildScriptPath = "/vendor/iframe-resizer-child.js"

export function Function_injectIframeResizerChildScript(Parameter_html: string): string {
	if (typeof window === "undefined") {
		return Parameter_html
	}

	// O documento do iframe e um blob:, que nao resolve caminho relativo: o src precisa ser absoluto.
	const Const_parentOrigin = window.location.origin

	// targetOrigin restringe o postMessage do child a nos, para nenhuma outra pagina conseguir se
	// passar pelo parent. A chave tem que ser "iframeResizer" (minusculo): e a unica que o child le
	// no ping inicial de "Ready".
	const Const_injectedScript = [
		`<script>window.iframeResizer = { targetOrigin: ${JSON.stringify(Const_parentOrigin)} }</script>`,
		`<script src="${Const_parentOrigin}${Const_iframeResizerChildScriptPath}"></script>`
	].join("")

	const Const_closingBodyIndex = Parameter_html.toLowerCase().lastIndexOf("</body>")
	if (Const_closingBodyIndex < 0) {
		return `${Parameter_html}${Const_injectedScript}`
	}

	return [
		Parameter_html.slice(0, Const_closingBodyIndex),
		Const_injectedScript,
		Parameter_html.slice(Const_closingBodyIndex)
	].join("")
}
