"use client"

import { useEffect, useRef } from "react"

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
	// Se não houver JWT, o backend responde com erro de autenticação normal.
	await fetch(Const_url.toString(), { credentials: "include" })
}

export function Component_DeviceReportClient(): null {
	const isReportedRef = useRef(false)

	useEffect(() => {
		if (isReportedRef.current) {
			return
		}
		isReportedRef.current = true

		Function_reportDispositivo().catch(() => undefined)
	}, [])

	return null
}
