"use client"

import type { Type_panelSession } from "@/app/painel/layout_context"
import type { Type_backendStudentBibliotecaResponse } from "@/env"
import { useEffect, useRef } from "react"

const Const_studentSessionStorageKey = "somente_alunos_student_session_v1"
const Const_cartStorageKeyPrefix = "somente_alunos_cart_v1"
const Const_libraryStorageKeyPrefix = "somente_alunos_library_v1"
const Const_pendingPaymentStorageKey = "somente_alunos_pending_payment_v1"
const Const_paymentPollIntervalMs = 3000
const Const_pendingPaymentMaxAgeMs = 5 * 60 * 1000
export const Const_paymentPaidEventName = "somente_alunos_payment_paid"
export const Const_cartClearedEventName = "somente_alunos_cart_cleared"
export const Const_pendingPaymentUpdatedEventName = "somente_alunos_pending_payment_updated"

export type Type_pendingPaymentStorage = {
	orderedUuid: string;
	contentUuidArray: string[];
	studentUuid: string;
	method: "pix" | "card_credit";
	createdAt: number;
}

type Type_paymentStatusResponse = {
	isPaid?: boolean;
}

function Function_isPendingPaymentExpired(Parameter_pendingPayment: Type_pendingPaymentStorage): boolean {
	const Const_createdAt = Parameter_pendingPayment.createdAt
	if (!Number.isFinite(Const_createdAt)) {
		return true
	}

	return Date.now() - Const_createdAt > Const_pendingPaymentMaxAgeMs
}

function Function_getSessionFromStorage(): Type_panelSession | null {
	if (typeof localStorage === "undefined") {
		return null
	}

	try {
		const Const_sessionJson = localStorage.getItem(Const_studentSessionStorageKey)
		if (!Const_sessionJson) {
			return null
		}

		const Const_sessionUnknown = JSON.parse(Const_sessionJson) as Partial<Type_panelSession>
		if (!Const_sessionUnknown?.student?.student_uuid) {
			return null
		}

		return {
			student: Const_sessionUnknown.student,
			collegeArray: Array.isArray(Const_sessionUnknown.collegeArray) ? Const_sessionUnknown.collegeArray : [],
			courseArray: Array.isArray(Const_sessionUnknown.courseArray) ? Const_sessionUnknown.courseArray : []
		}
	}
	catch {
		return null
	}
}

function Function_getPendingPaymentFromStorage(): Type_pendingPaymentStorage | null {
	if (typeof localStorage === "undefined") {
		return null
	}

	try {
		const Const_storageValue = localStorage.getItem(Const_pendingPaymentStorageKey)
		if (!Const_storageValue) {
			return null
		}

		const Const_storageUnknown = JSON.parse(Const_storageValue) as Partial<Type_pendingPaymentStorage>
		if (!Const_storageUnknown?.orderedUuid || !Array.isArray(Const_storageUnknown.contentUuidArray)) {
			return null
		}

		return {
			orderedUuid: Const_storageUnknown.orderedUuid,
			contentUuidArray: Const_storageUnknown.contentUuidArray.filter((Parameter_item): Parameter_item is string => typeof Parameter_item === "string"),
			studentUuid: Const_storageUnknown.studentUuid || "",
			method: Const_storageUnknown.method === "card_credit" ? "card_credit" : "pix",
			createdAt: typeof Const_storageUnknown.createdAt === "number" ? Const_storageUnknown.createdAt : Date.now()
		}
	}
	catch {
		return null
	}
}

function Function_clearPendingPaymentStorage(): void {
	if (typeof localStorage === "undefined") {
		return
	}

	localStorage.removeItem(Const_pendingPaymentStorageKey)
}

function Function_getCartStorageKey(Parameter_studentUuid: string): string {
	if (!Parameter_studentUuid) {
		return ""
	}

	return `${Const_cartStorageKeyPrefix}:${Parameter_studentUuid}`
}

function Function_getLibraryStorageKey(Parameter_session: Type_panelSession | null): string {
	const Const_studentUuid = Parameter_session?.student?.student_uuid || ""
	const Const_collegeUuid = Parameter_session?.student?.college_uuid_student || ""
	const Const_courseUuid = Parameter_session?.student?.course_uuid_student || ""
	if (!Const_studentUuid || !Const_collegeUuid || !Const_courseUuid) {
		return ""
	}

	return `${Const_libraryStorageKeyPrefix}:${Const_studentUuid}:${Const_collegeUuid}:${Const_courseUuid}`
}

async function Function_fetchPaymentStatus(Parameter_orderedUuid: string): Promise<boolean> {
	const Const_txid = encodeURIComponent(Parameter_orderedUuid)
	const Const_response = await fetch(`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/get/student/pagamento-feito?txid=${Const_txid}`, {
		credentials: "include"
	})
	if (!Const_response.ok) {
		return false
	}

	const Const_responseBody = await Const_response.json() as Type_paymentStatusResponse
	return Const_responseBody?.isPaid === true
}

async function Function_clearBackendCart(Parameter_contentUuidArray: string[]): Promise<void> {
	await Promise.allSettled(Parameter_contentUuidArray.map(async (Parameter_contentUuid) => {
		if (!Parameter_contentUuid) {
			return
		}

		await fetch(`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/patch/student/carrinho`, {
			method: "PATCH",
			headers: { "content-type": "application/json; charset=utf-8" },
			credentials: "include",
			body: JSON.stringify({
				content: { content_uuid: Parameter_contentUuid },
				action: "remove"
			})
		})
	}))
}

async function Function_refreshLibraryCache(Parameter_session: Type_panelSession | null): Promise<void> {
	const Const_collegeUuid = Parameter_session?.student?.college_uuid_student || ""
	const Const_courseUuid = Parameter_session?.student?.course_uuid_student || ""
	const Const_storageKey = Function_getLibraryStorageKey(Parameter_session)
	if (!Const_collegeUuid || !Const_courseUuid || !Const_storageKey) {
		return
	}

	const Const_url = new URL(`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/get/student/biblioteca`)
	Const_url.searchParams.set("college_uuid_content", Const_collegeUuid)
	Const_url.searchParams.set("course_uuid_content", Const_courseUuid)

	const Const_response = await fetch(Const_url.toString(), { credentials: "include" })
	if (!Const_response.ok) {
		return
	}

	const Const_responseBody = await Const_response.json() as Type_backendStudentBibliotecaResponse
	const Const_contentArray = Array.isArray(Const_responseBody.contentArray) ? Const_responseBody.contentArray : []
	localStorage.setItem(Const_storageKey, JSON.stringify({ contentArray: Const_contentArray }))
}

export function Function_savePendingPayment(Parameter_payment: Type_pendingPaymentStorage): void {
	if (typeof localStorage === "undefined") {
		return
	}

	localStorage.setItem(Const_pendingPaymentStorageKey, JSON.stringify(Parameter_payment))
	window.dispatchEvent(new CustomEvent(Const_pendingPaymentUpdatedEventName))
}

export function Component_PaymentStatusWatcherClient(): null {
	const isCheckingRef = useRef(false)

	useEffect(() => {
		let Let_intervalId: number | null = null
		let Let_isMounted = true

		const Function_checkPendingPayment = async (): Promise<void> => {
			if (isCheckingRef.current) {
				return
			}

			const Const_pendingPayment = Function_getPendingPaymentFromStorage()
			if (!Const_pendingPayment?.orderedUuid) {
				return
			}
			if (Function_isPendingPaymentExpired(Const_pendingPayment)) {
				Function_clearPendingPaymentStorage()
				return
			}

			try {
				isCheckingRef.current = true
				const Const_isPaid = await Function_fetchPaymentStatus(Const_pendingPayment.orderedUuid)
				if (!Let_isMounted || !Const_isPaid) {
					return
				}

				const Const_session = Function_getSessionFromStorage()
				const Const_studentUuid = Const_pendingPayment.studentUuid || Const_session?.student?.student_uuid || ""
				const Const_cartStorageKey = Function_getCartStorageKey(Const_studentUuid)
				if (Const_cartStorageKey) {
					localStorage.removeItem(Const_cartStorageKey)
				}

				await Function_clearBackendCart(Const_pendingPayment.contentUuidArray)
				await Function_refreshLibraryCache(Const_session)
				Function_clearPendingPaymentStorage()

				window.dispatchEvent(new CustomEvent(Const_cartClearedEventName, {
					detail: { orderedUuid: Const_pendingPayment.orderedUuid }
				}))
				window.dispatchEvent(new CustomEvent(Const_paymentPaidEventName, {
					detail: { orderedUuid: Const_pendingPayment.orderedUuid }
				}))
			}
			finally {
				isCheckingRef.current = false
			}
		}

		const Function_startWatcher = (): void => {
			if (Let_intervalId !== null) {
				return
			}

			Function_checkPendingPayment().catch(() => undefined)
			Let_intervalId = window.setInterval(() => {
				Function_checkPendingPayment().catch(() => undefined)
			}, Const_paymentPollIntervalMs)
		}

		Function_startWatcher()
		window.addEventListener(Const_pendingPaymentUpdatedEventName, Function_startWatcher)

		return () => {
			Let_isMounted = false
			if (Let_intervalId !== null) {
				window.clearInterval(Let_intervalId)
			}
			window.removeEventListener(Const_pendingPaymentUpdatedEventName, Function_startWatcher)
		}
	}, [])

	return null
}
