/**
 * O visualizador roda o HTML do aluno num iframe com sandbox="allow-scripts" (origem opaca),
 * entao o parent nao consegue ler contentDocument para medir a altura. O HTML e servido direto
 * pela API (api.somentealunos.vip), que injeta um <script> medidor reportando a altura por
 * postMessage. Este modulo guarda apenas o identificador da mensagem, usado tanto pelo backend
 * (ao injetar) quanto pelo listener do modal (ao validar). Os dois lados precisam bater.
 */

export const Const_viewerHeightMessageSource = "somente-alunos-viewer"
