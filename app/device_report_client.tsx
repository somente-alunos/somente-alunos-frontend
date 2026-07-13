"use client"

import { useEffect, useRef } from "react"

const Const_libraryPathname = "/painel/biblioteca"
const Const_deviceReportPendingStorageKey = "somente_alunos_device_report_pending_v1"
const Const_deviceReportDoneWindowKey = "__somente_alunos_device_report_done_v1__"

function Function_getDispositivo(): "celular" | "computador" {
	if (typeof navigator === "undefined") {
		return "computador"
	}

	const Const_userAgent = navigator.userAgent || ""
	const Const_isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(Const_userAgent)
	return Const_isMobile ? "celular" : "computador"
}

async function Function_reportDispositivo(): Promise<void> {
	const Const_dispositivo = Function_getDispositivo()
	const Const_url = new URL(`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/get/student/celular-ou-computador`)
	Const_url.searchParams.set("dispositivo", Const_dispositivo)

	// O JWT do aluno vai automaticamente nos cookies (credentials: include).
	await fetch(Const_url.toString(), { credentials: "include" })
}

// Chamada em /entrar sempre que um JWT valido do aluno acabou de ser confirmado
// (login novo ou sessao existente revalidada). A biblioteca consome esse marcador
// ao montar, garantindo que o dispositivo seja reportado com o JWT do perfil certo.
export function Function_markDeviceReportPendingAfterLogin(): void {
	if (typeof sessionStorage === "undefined") {
		return
	}

	sessionStorage.setItem(Const_deviceReportPendingStorageKey, "1")
}

function Function_consumeDeviceReportPendingAfterLogin(): boolean {
	if (typeof sessionStorage === "undefined") {
		return false
	}

	const Const_isPending = sessionStorage.getItem(Const_deviceReportPendingStorageKey) === "1"
	if (Const_isPending) {
		sessionStorage.removeItem(Const_deviceReportPendingStorageKey)
	}

	return Const_isPending
}

// O documento atual foi aberto/recarregado direto na biblioteca? O name da entrada de
// navigation timing guarda a URL do documento carregado, entao continua valido mesmo
// depois de navegacoes client-side dentro do painel.
function Function_isDocumentLoadedOnLibrary(): boolean {
	const [Const_navigationEntry] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[]
	if (!Const_navigationEntry) {
		return false
	}

	try {
		return new URL(Const_navigationEntry.name, window.location.origin).pathname === Const_libraryPathname
	}
	catch {
		return false
	}
}

function Function_hasWindowAlreadyReported(): boolean {
	return (window as unknown as Record<string, boolean>)[Const_deviceReportDoneWindowKey] === true
}

function Function_markWindowAsReported(): void {
	(window as unknown as Record<string, boolean>)[Const_deviceReportDoneWindowKey] = true
}

// Reporta o dispositivo em dois momentos, e somente neles:
// 1. Recarregar/abrir a pagina direto na biblioteca.
// 2. Cair na biblioteca logo depois de /entrar confirmar o JWT do aluno.
// Navegar entre paginas do painel (carrinho, carteira...) e voltar nao reporta de novo.
export function Function_useDeviceReportOnLibrary(Parameter_isSessionReady: boolean): void {
	const isReportedRef = useRef(false)

	useEffect(() => {
		if (!Parameter_isSessionReady || isReportedRef.current) {
			return
		}

		if (window.location.pathname !== Const_libraryPathname) {
			return
		}

		const Const_isAfterLogin = Function_consumeDeviceReportPendingAfterLogin()
		const Const_isPageLoad = !Function_hasWindowAlreadyReported() && Function_isDocumentLoadedOnLibrary()
		if (!Const_isAfterLogin && !Const_isPageLoad) {
			return
		}

		isReportedRef.current = true
		Function_markWindowAsReported()

		Function_reportDispositivo().catch(() => undefined)
	}, [Parameter_isSessionReady])
}
