"use client"

export const runtime = "edge"

import { Type_panelSession } from "@/app/painel/layout_context"
import {
	Const_cartClearedEventName,
	Const_paymentPaidEventName,
	Function_savePendingPayment
} from "@/app/payment_status_watcher_client"
import { Component_HeaderIdChatbotContentServer } from "@/component/(path_[id-chatbot])/layout_[id-chatbot]/ui/header_[id-chatbot]/header_[id-chatbot]_content_server"
import { Component_ContentViewerModalClient } from "@/component/shared/content_viewer_modal_client"
import {
	Type_backendContent,
	Type_backendStudentPixPaymentResponse
} from "@/env"
import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Snippet,
	Spinner
} from "@nextui-org/react"
import { ArrowLeft, Calendar, CheckCircle2, Copy, CreditCard, LockOpen, QrCode, X } from "lucide-react"
import { useRouter } from "next/navigation"
import QRCode from "react-qr-code"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

const Const_studentSessionStorageKey = "somente_alunos_student_session_v1"
const Const_cartStorageKeyPrefix = "somente_alunos_cart_v1"

type Type_cartResponse = {
	cartArray?: Type_backendContent[];
}

type Type_cartDisplayContent = Type_backendContent

type Type_paymentStatusResponse = {
	isPaid?: boolean;
}

const Const_paymentPollIntervalMs = 3000
const Const_pendingPaymentMaxAgeMs = 5 * 60 * 1000

function Function_getCartStorageKey(Parameter_studentUuid: string): string {
	if (!Parameter_studentUuid) {
		return ""
	}

	return `${Const_cartStorageKeyPrefix}:${Parameter_studentUuid}`
}

function Function_getCartSignature(Parameter_cartArray: Type_cartDisplayContent[]): string {
	return JSON.stringify(
		Parameter_cartArray.map((Parameter_single) => ([
			Parameter_single.content_uuid,
			Parameter_single.content_update,
			Parameter_single.name_content,
			Parameter_single.student_uuid_content,
			Parameter_single.old_price_content ?? null,
			Parameter_single.current_price_content,
			Parameter_single.preview_file_uuid_content ?? null,
			Parameter_single.full_file_uuid_content ?? null,
			Parameter_single.prevision_content ?? null,
			Parameter_single.verified_content
		]))
	)
}

function Function_getCartFromStorage(Parameter_storageKey: string): Type_cartDisplayContent[] | null {
	if (typeof localStorage === "undefined" || !Parameter_storageKey) {
		return null
	}

	try {
		const Const_storageValue = localStorage.getItem(Parameter_storageKey)
		if (!Const_storageValue) {
			return null
		}

		const Const_storageUnknown = JSON.parse(Const_storageValue) as { cartArray?: unknown }
		if (!Array.isArray(Const_storageUnknown?.cartArray)) {
			return null
		}

		return Const_storageUnknown.cartArray as Type_cartDisplayContent[]
	}
	catch {
		return null
	}
}

function Function_saveCartOnStorage(Parameter_storageKey: string, Parameter_cartArray: Type_cartDisplayContent[]): void {
	if (typeof localStorage === "undefined" || !Parameter_storageKey) {
		return
	}

	localStorage.setItem(Parameter_storageKey, JSON.stringify({
		cartArray: Parameter_cartArray
	}))
}

function Function_clearCartStorage(Parameter_storageKey: string): void {
	if (typeof localStorage === "undefined" || !Parameter_storageKey) {
		return
	}

	localStorage.removeItem(Parameter_storageKey)
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


function Function_formatCurrencyBRL(Parameter_value: number): string {
	return `R$ ${Parameter_value.toFixed(2).replace(".", ",")}`
}

function Function_getStudentAlias(Parameter_studentUuid: string): string {
	return `@${(Parameter_studentUuid || "").split("-")[0] || "anonimo"}`
}

export default function Page_Carrinho(): JSX.Element {
	const Const_router = useRouter()
	const [isSession, setSession] = useState<Type_panelSession | null>(null)
	const [isPageLoading, setPageLoading] = useState(true)
	const [isCartLoading, setCartLoading] = useState(false)
	const [isNavigationLoadingTarget, setNavigationLoadingTarget] = useState("")
	const [isPressedCartCardUuid, setPressedCartCardUuid] = useState("")
	const [isRemoveLoadingUuid, setRemoveLoadingUuid] = useState("")

	const [isCartArray, setCartArray] = useState<Type_cartDisplayContent[]>([])
	const [isPageError, setPageError] = useState("")

	const [isPixModalOpen, setPixModalOpen] = useState(false)
	const [isPaymentStep, setPaymentStep] = useState<"method_selection" | "pix_payment">("method_selection")
	const [isPaymentStatus, setPaymentStatus] = useState<"idle" | "waiting" | "paid" | "error">("idle")
	const [isShowCardMaintenance, setShowCardMaintenance] = useState(false)
	const [isPixGenerating, setPixGenerating] = useState(false)
	const [isPixCode, setPixCode] = useState("")
	const [isPixCopied, setPixCopied] = useState(false)
	const [isPixMessage, setPixMessage] = useState("")
	const [isOrderedUuid, setOrderedUuid] = useState("")
	const [isPaymentCreatedAt, setPaymentCreatedAt] = useState(0)

	const [isViewerModalOpen, setViewerModalOpen] = useState(false)
	const [isViewerLoading, setViewerLoading] = useState(false)
	const [isViewerError, setViewerError] = useState("")
	const [isViewerItem, setViewerItem] = useState<Type_cartDisplayContent | null>(null)
	const [isViewerFileUrl, setViewerFileUrl] = useState("")
	const [isViewerFileMimeType, setViewerFileMimeType] = useState("")
	const [isViewerIframeHeightPx, setViewerIframeHeightPx] = useState(0)

	const isViewerIframeRef = useRef<HTMLIFrameElement | null>(null)
	const isViewerFileUrlRef = useRef("")
	const isCartSignatureRef = useRef(Function_getCartSignature([]))
	const isPaymentPollIntervalRef = useRef<number | null>(null)
	const isPaymentRedirectTimeoutRef = useRef<number | null>(null)
	const isPaymentConfirmedRef = useRef(false)

	const isCartStorageKey = useMemo(() => {
		const Const_studentUuid = isSession?.student?.student_uuid || ""
		return Function_getCartStorageKey(Const_studentUuid)
	}, [isSession])

	const isCartTotalAmount = useMemo(() => {
		const Const_total = isCartArray.reduce((Parameter_total, Parameter_single) => {
			return Parameter_total + Parameter_single.current_price_content
		}, 0)
		return Number(Const_total.toFixed(2))
	}, [isCartArray])

	const isCartOldTotalAmount = useMemo(() => {
		const Const_totalOld = isCartArray.reduce((Parameter_total, Parameter_single) => {
			if (
				typeof Parameter_single.old_price_content === "number" &&
				Parameter_single.old_price_content > Parameter_single.current_price_content
			) {
				return Parameter_total + Parameter_single.old_price_content
			}

			return Parameter_total + Parameter_single.current_price_content
		}, 0)

		return Number(Const_totalOld.toFixed(2))
	}, [isCartArray])

	const isViewerHtmlFile = useMemo(() => {
		const Const_mimeType = isViewerFileMimeType.trim().toLowerCase()
		return Const_mimeType.includes("text/html") || Const_mimeType.includes("application/xhtml+xml")
	}, [isViewerFileMimeType])

	const isCartHasDiscount = isCartOldTotalAmount > isCartTotalAmount
	const isPaymentCompleted = isPaymentStatus === "paid"

	const isCartContentLabel = useMemo(() => {
		if (isCartArray.length === 1) {
			return "1 conteúdo"
		}

		return `${isCartArray.length} conteúdos`
	}, [isCartArray.length])

	const isUnlockButtonLabel = useMemo(() => {
		return isCartArray.length === 1 ? "Desbloquear conteúdo" : "Desbloquear conteúdos"
	}, [isCartArray.length])

	const isCheckoutHeadline = useMemo(() => {
		if (isCartArray.length === 1) {
			return isCartArray[0]?.name_content || "Conteúdo selecionado"
		}

		return `${isCartArray.length} conteúdos selecionados`
	}, [isCartArray])

	const Function_setCartArrayIfDifferent = useCallback((Parameter_nextCartArray: Type_cartDisplayContent[]): void => {
		const Const_nextSignature = Function_getCartSignature(Parameter_nextCartArray)
		if (Const_nextSignature === isCartSignatureRef.current) {
			return
		}

		isCartSignatureRef.current = Const_nextSignature
		setCartArray(Parameter_nextCartArray)
		Function_saveCartOnStorage(isCartStorageKey, Parameter_nextCartArray)
	}, [isCartStorageKey])

	const Function_clearPaymentTimers = useCallback((): void => {
		if (isPaymentPollIntervalRef.current !== null) {
			window.clearInterval(isPaymentPollIntervalRef.current)
			isPaymentPollIntervalRef.current = null
		}

		if (isPaymentRedirectTimeoutRef.current !== null) {
			window.clearTimeout(isPaymentRedirectTimeoutRef.current)
			isPaymentRedirectTimeoutRef.current = null
		}
	}, [])

	const Function_clearCartOnStorageAndState = useCallback((): void => {
		const Const_emptySignature = Function_getCartSignature([])
		isCartSignatureRef.current = Const_emptySignature
		setCartArray([])
		Function_clearCartStorage(isCartStorageKey)
	}, [isCartStorageKey])

	const Function_clearBackendCart = useCallback(async (Parameter_cartArray: Type_cartDisplayContent[]): Promise<void> => {
		if (Parameter_cartArray.length <= 0) {
			return
		}

		await Promise.allSettled(Parameter_cartArray.map(async (Parameter_content) => {
			try {
				const Const_response = await fetch(`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/patch/student/carrinho`, {
					method: "PATCH",
					headers: { "content-type": "application/json; charset=utf-8" },
					credentials: "include",
					body: JSON.stringify({
						content: { content_uuid: Parameter_content.content_uuid },
						action: "remove"
					})
				})

				if (!Const_response.ok) {
					throw new Error(`Falha ao remover conteúdo do carrinho: ${Const_response.status}`)
				}
			}
			catch {
				// Mantemos a limpeza visual mesmo se uma remocao falhar no backend.
			}
		}))
	}, [])

	const Function_fetchPaymentStatus = useCallback(async (Parameter_orderedUuid: string): Promise<boolean | null> => {
		if (!Parameter_orderedUuid) {
			return null
		}

		const Const_txid = encodeURIComponent(Parameter_orderedUuid)
		const Const_statusUrlArray = [
			`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/get/student/pagamento-feito?txid=${Const_txid}`
		]

		for (const Const_statusUrl of Const_statusUrlArray) {
			try {
				const Const_response = await fetch(Const_statusUrl, {
					credentials: "include"
				})

				if (Const_response.status === 451) {
					Const_router.push("/entrar")
					return null
				}

				if (!Const_response.ok) {
					continue
				}

				const Const_responseBody = await Const_response.json() as Type_paymentStatusResponse
				if (typeof Const_responseBody?.isPaid === "boolean") {
					return Const_responseBody.isPaid
				}
			}
			catch {
				// Tenta o proxmo endpoint de compatibilidade sem interromper o polling.
			}
		}

		return false
	}, [Const_router, Function_clearPaymentTimers])

	const Function_finalizeSuccessfulPayment = useCallback(async (): Promise<void> => {
		if (isPaymentConfirmedRef.current) {
			return
		}

		isPaymentConfirmedRef.current = true
		Function_clearPaymentTimers()
		setPaymentStatus("paid")
		setPixMessage("Pagamento concluído. Seus conteúdos foram liberados.")
		setPixCopied(false)
		setShowCardMaintenance(false)

		const Const_paidCartArray = [...isCartArray]
		Function_clearCartOnStorageAndState()
		await Function_clearBackendCart(Const_paidCartArray)

		isPaymentRedirectTimeoutRef.current = window.setTimeout(() => {
			setPixModalOpen(false)
			setPaymentStep("method_selection")
			setPaymentStatus("idle")
			setOrderedUuid("")
			Const_router.push("/painel/biblioteca")
		}, 1800)
	}, [Const_router, Function_clearBackendCart, Function_clearCartOnStorageAndState, Function_clearPaymentTimers, isCartArray])

	const Function_fetchCart = useCallback(async (Parameter_showLoading: boolean): Promise<void> => {
		try {
			if (Parameter_showLoading) {
				setCartLoading(true)
			}
			setPageError("")

			const Const_response = await fetch(`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/get/student/carrinho`, {
				credentials: "include"
			})

			if (!Const_response.ok) {
				if (Const_response.status === 451) {
					Const_router.push("/entrar")
					return
				}

				throw new Error("Falha ao carregar carrinho")
			}

			const Const_responseBody = await Const_response.json() as Type_cartResponse
			const Const_serverCartArray = Array.isArray(Const_responseBody.cartArray) ? Const_responseBody.cartArray : []
			Function_setCartArrayIfDifferent(Const_serverCartArray)
			Function_saveCartOnStorage(isCartStorageKey, Const_serverCartArray)
		}
		catch {
			setPageError("Não foi possível carregar seu carrinho agora.")
		}
		finally {
			if (Parameter_showLoading) {
				setCartLoading(false)
			}
		}
	}, [Const_router, isCartStorageKey, Function_setCartArrayIfDifferent])

	useEffect(() => {
		const Const_session = Function_getSessionFromStorage()
		if (!Const_session) {
			Const_router.push("/entrar")
			return
		}

		setSession(Const_session)
		setPageLoading(false)
	}, [Const_router])

	useEffect(() => {
		if (!isSession) {
			return
		}

		const Const_cachedCartArray = Function_getCartFromStorage(isCartStorageKey)
		if (Const_cachedCartArray) {
			const Const_cachedSignature = Function_getCartSignature(Const_cachedCartArray)
			if (Const_cachedSignature !== isCartSignatureRef.current) {
				isCartSignatureRef.current = Const_cachedSignature
				setCartArray(Const_cachedCartArray)
			}
			setCartLoading(false)
		}
		else {
			const Const_emptySignature = Function_getCartSignature([])
			if (Const_emptySignature !== isCartSignatureRef.current) {
				isCartSignatureRef.current = Const_emptySignature
				setCartArray([])
			}
		}

		Function_fetchCart(!Const_cachedCartArray).catch(() => undefined)
	}, [isSession, isCartStorageKey, Function_fetchCart])

	const Function_navigateWithFeedback = useCallback((Parameter_route: string, Parameter_target: string): void => {
		if (isNavigationLoadingTarget) {
			return
		}

		setNavigationLoadingTarget(Parameter_target)
		Const_router.push(Parameter_route)
	}, [Const_router, isNavigationLoadingTarget])

	const Function_removeCartItem = useCallback(async (Parameter_content: Type_cartDisplayContent): Promise<void> => {
		if (isRemoveLoadingUuid || isNavigationLoadingTarget) {
			return
		}

		try {
			setRemoveLoadingUuid(Parameter_content.content_uuid)
			setPageError("")

			const Const_response = await fetch(`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/patch/student/carrinho`, {
				method: "PATCH",
				headers: { "content-type": "application/json; charset=utf-8" },
				credentials: "include",
				body: JSON.stringify({
					content: { content_uuid: Parameter_content.content_uuid },
					action: "remove"
				})
			})
			if (!Const_response.ok) {
				if (Const_response.status === 451) {
					Const_router.push("/entrar")
					return
				}

				throw new Error("Falha ao remover conteúdo do carrinho")
			}

			const Const_responseBody = await Const_response.json() as Type_cartResponse
			const Const_serverCartArray = Array.isArray(Const_responseBody.cartArray) ? Const_responseBody.cartArray : []
			Function_setCartArrayIfDifferent(Const_serverCartArray)
			Function_saveCartOnStorage(isCartStorageKey, Const_serverCartArray)
		}
		catch {
			setPageError("Não foi possível remover esse conteúdo agora.")
		}
		finally {
			setRemoveLoadingUuid("")
		}
	}, [Const_router, isCartStorageKey, isNavigationLoadingTarget, isRemoveLoadingUuid, Function_setCartArrayIfDifferent])

	const Function_clearViewerFileUrl = useCallback(() => {
		if (isViewerFileUrlRef.current) {
			URL.revokeObjectURL(isViewerFileUrlRef.current)
			isViewerFileUrlRef.current = ""
		}

		setViewerFileUrl("")
		setViewerFileMimeType("")
		setViewerIframeHeightPx(0)
	}, [])

	const Function_loadViewerFile = useCallback(async (Parameter_content: Type_cartDisplayContent): Promise<void> => {
		setViewerLoading(true)
		setViewerError("")

		try {
			const Const_response = await fetch(
				`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/get/student/conteudo/file?content_uuid=${encodeURIComponent(Parameter_content.content_uuid)}`,
				{ credentials: "include" }
			)
			if (!Const_response.ok) {
				if (Const_response.status === 451) {
					Const_router.push("/entrar")
					return
				}

				throw new Error("Falha ao carregar prévia do conteúdo")
			}

			const Const_blob = await Const_response.blob()
			Function_clearViewerFileUrl()
			const Const_blobUrl = URL.createObjectURL(Const_blob)
			isViewerFileUrlRef.current = Const_blobUrl
			setViewerFileUrl(Const_blobUrl)
			setViewerFileMimeType((Const_response.headers.get("content-type") || Const_blob.type || "").trim().toLowerCase())
		}
		catch {
			setViewerError("Não foi possível abrir a prévia desse conteúdo agora.")
		}
		finally {
			setViewerLoading(false)
		}
	}, [Const_router, Function_clearViewerFileUrl])

	const Function_syncViewerIframeHeight = useCallback(() => {
		if (!isViewerHtmlFile) {
			return
		}

		const Const_iframe = isViewerIframeRef.current
		if (!Const_iframe) {
			return
		}

		try {
			const Const_document = Const_iframe.contentDocument
			if (!Const_document) {
				return
			}

			const Const_body = Const_document.body
			const Const_root = Const_document.documentElement
			const Const_nextHeight = Math.max(
				Const_body?.scrollHeight || 0,
				Const_root?.scrollHeight || 0,
				Const_body?.offsetHeight || 0,
				Const_root?.offsetHeight || 0
			)

			if (Const_nextHeight > 0) {
				setViewerIframeHeightPx(Const_nextHeight)
			}
		}
		catch {
			// Ignora erro silenciosamente quando o browser bloqueia leitura do iframe.
		}
	}, [isViewerHtmlFile])

	const Function_handleViewerIframeLoad = useCallback(() => {
		if (!isViewerHtmlFile) {
			return
		}

		Function_syncViewerIframeHeight()
		window.setTimeout(Function_syncViewerIframeHeight, 120)
		window.setTimeout(Function_syncViewerIframeHeight, 600)
	}, [isViewerHtmlFile, Function_syncViewerIframeHeight])

	const Function_openPreview = useCallback(async (Parameter_content: Type_cartDisplayContent): Promise<void> => {
		setViewerItem(Parameter_content)
		setViewerModalOpen(true)
		await Function_loadViewerFile(Parameter_content)
	}, [Function_loadViewerFile])

	const Function_closePreviewModal = useCallback((): void => {
		setViewerModalOpen(false)
		setViewerItem(null)
		setViewerLoading(false)
		setViewerError("")
		Function_clearViewerFileUrl()
	}, [Function_clearViewerFileUrl])

	useEffect(() => {
		if (!isViewerModalOpen || !isViewerHtmlFile || !isViewerFileUrl) {
			return
		}

		const Const_timeoutIdShort = window.setTimeout(Function_syncViewerIframeHeight, 80)
		const Const_timeoutIdLong = window.setTimeout(Function_syncViewerIframeHeight, 900)
		return () => {
			window.clearTimeout(Const_timeoutIdShort)
			window.clearTimeout(Const_timeoutIdLong)
		}
	}, [isViewerModalOpen, isViewerHtmlFile, isViewerFileUrl, Function_syncViewerIframeHeight])

	useEffect(() => {
		return () => {
			Function_clearViewerFileUrl()
		}
	}, [Function_clearViewerFileUrl])

	const Function_generatePix = useCallback(async (): Promise<void> => {
		if (isPixGenerating || isCartArray.length <= 0) {
			return
		}

		try {
			setPixGenerating(true)
			setPaymentStatus("waiting")
			isPaymentConfirmedRef.current = false
			setPixMessage("")
			setPixCode("")
			setOrderedUuid("")
			setPaymentCreatedAt(0)
			Function_clearPaymentTimers()

			const Const_contentUuidArray = isCartArray.map((Parameter_single) => Parameter_single.content_uuid)
			if (Const_contentUuidArray.length <= 0) {
				throw new Error("Carrinho vazio")
			}

			const Const_response = await fetch(`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/post/student/gerar-cobranca`, {
				method: "POST",
				headers: { "content-type": "application/json; charset=utf-8" },
				credentials: "include",
				body: JSON.stringify({
					method: "pix",
					contentUuidArray: Const_contentUuidArray
				})
			})
			if (!Const_response.ok) {
				if (Const_response.status === 451) {
					Const_router.push("/entrar")
					return
				}

				throw new Error("Falha ao gerar Pix")
			}

			const Const_responseBody = await Const_response.json() as Type_backendStudentPixPaymentResponse
			const Const_pixCopiaECola = Const_responseBody?.pixCopiaECola || ""
			const Const_orderedUuid = Const_responseBody?.orderedUuid || ""
			if (!Const_pixCopiaECola) {
				throw new Error("Pix não retornado")
			}
			if (!Const_orderedUuid) {
				throw new Error("Identificador da cobrança não retornado")
			}

			setPixCode(Const_pixCopiaECola)
			setOrderedUuid(Const_orderedUuid)
			const Const_paymentCreatedAt = Date.now()
			setPaymentCreatedAt(Const_paymentCreatedAt)
			Function_savePendingPayment({
				orderedUuid: Const_orderedUuid,
				contentUuidArray: Array.isArray(Const_responseBody?.contentUuidArray) ? Const_responseBody.contentUuidArray : Const_contentUuidArray,
				studentUuid: isSession?.student?.student_uuid || "",
				method: "pix",
				createdAt: Const_paymentCreatedAt
			})
			setPixMessage("Pix gerado com sucesso. Finalize o pagamento para liberar os conteúdos.")
		}
		catch {
			setPaymentStatus("error")
			setPixMessage("Não foi possível gerar o Pix agora. Tente novamente.")
		}
		finally {
			setPixGenerating(false)
		}
	}, [Const_router, Function_clearPaymentTimers, isCartArray, isPixGenerating, isSession])

	const Function_generateCardCredit = useCallback(async (): Promise<void> => {
		if (isPixGenerating || isCartArray.length <= 0) {
			return
		}

		try {
			setPixGenerating(true)
			setPaymentStatus("waiting")
			isPaymentConfirmedRef.current = false
			setPixMessage("")
			setOrderedUuid("")
			setPaymentCreatedAt(0)
			Function_clearPaymentTimers()

			const Const_contentUuidArray = isCartArray.map((Parameter_single) => Parameter_single.content_uuid)
			if (Const_contentUuidArray.length <= 0) {
				throw new Error("Carrinho vazio")
			}

			const Const_response = await fetch(`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/post/student/gerar-cobranca`, {
				method: "POST",
				headers: { "content-type": "application/json; charset=utf-8" },
				credentials: "include",
				body: JSON.stringify({
					method: "card_credit",
					contentUuidArray: Const_contentUuidArray
				})
			})
			if (!Const_response.ok) {
				if (Const_response.status === 451) {
					Const_router.push("/entrar")
					return
				}

				throw new Error("Falha ao gerar pagamento por cartao")
			}

			const Const_responseBody = await Const_response.json() as Type_backendStudentPixPaymentResponse
			const Const_paymentUrl = Const_responseBody?.payment_url || ""
			const Const_orderedUuid = Const_responseBody?.orderedUuid || ""
			if (!Const_paymentUrl) {
				throw new Error("Link de pagamento nao retornado")
			}
			if (!Const_orderedUuid) {
				throw new Error("Identificador da cobranca nao retornado")
			}

			const Const_paymentCreatedAt = Date.now()
			setPaymentCreatedAt(Const_paymentCreatedAt)
			Function_savePendingPayment({
				orderedUuid: Const_orderedUuid,
				contentUuidArray: Array.isArray(Const_responseBody?.contentUuidArray) ? Const_responseBody.contentUuidArray : Const_contentUuidArray,
				studentUuid: isSession?.student?.student_uuid || "",
				method: "card_credit",
				createdAt: Const_paymentCreatedAt
			})
			window.location.href = Const_paymentUrl
		}
		catch {
			setPaymentStatus("error")
			setPixMessage("Nao foi possivel abrir o pagamento por cartao agora. Tente novamente.")
		}
		finally {
			setPixGenerating(false)
		}
	}, [Const_router, Function_clearPaymentTimers, isCartArray, isPixGenerating, isSession])

	const Function_copyPix = useCallback((): void => {
		if (!isPixCode) {
			return
		}

		navigator.clipboard.writeText(isPixCode)
		setPixCopied(true)
		setTimeout(() => setPixCopied(false), 3000)
	}, [isPixCode])

	const Function_handlePixPayment = useCallback(async (): Promise<void> => {
		setPaymentStep("pix_payment")
		setPaymentStatus("waiting")
		if (isPixCode || isPixGenerating) {
			return
		}

		await Function_generatePix()
	}, [Function_generatePix, isPixCode, isPixGenerating])

	const Function_openLibraryAfterPayment = useCallback((): void => {
		Function_clearPaymentTimers()
		setPixModalOpen(false)
		setPaymentStep("method_selection")
		setPaymentStatus("idle")
		setOrderedUuid("")
		setPaymentCreatedAt(0)
		Const_router.push("/painel/biblioteca")
	}, [Const_router, Function_clearPaymentTimers])

	const Function_openCheckoutModal = useCallback((): void => {
		Function_clearPaymentTimers()
		isPaymentConfirmedRef.current = false
		setPixMessage("")
		setPixCode("")
		setPixCopied(false)
		setPaymentStep("method_selection")
		setPaymentStatus("idle")
		setOrderedUuid("")
		setPaymentCreatedAt(0)
		setShowCardMaintenance(false)
		setPixModalOpen(true)
	}, [Function_clearPaymentTimers])

	const Function_handlePaymentModalOpenChange = useCallback((Parameter_isOpen: boolean): void => {
		setPixModalOpen(Parameter_isOpen)
		if (!Parameter_isOpen) {
			Function_clearPaymentTimers()
			if (isPaymentStatus === "paid") {
				Function_openLibraryAfterPayment()
				return
			}

			isPaymentConfirmedRef.current = false
			setPaymentStep("method_selection")
			setPaymentStatus("idle")
			setOrderedUuid("")
			setPaymentCreatedAt(0)
			setShowCardMaintenance(false)
			setPixMessage("")
			setPixCode("")
			setPixCopied(false)
		}
	}, [Function_clearPaymentTimers, Function_openLibraryAfterPayment, isPaymentStatus])

	useEffect(() => {
		const Function_handleCartCleared = (): void => {
			Function_clearCartOnStorageAndState()
		}

		const Function_handlePaymentPaid = (Parameter_event: Event): void => {
			const Const_customEvent = Parameter_event as CustomEvent<{ orderedUuid?: string }>
			const Const_paidOrderedUuid = Const_customEvent.detail?.orderedUuid || ""
			if (isOrderedUuid && Const_paidOrderedUuid && isOrderedUuid !== Const_paidOrderedUuid) {
				return
			}

			Function_clearPaymentTimers()
			isPaymentConfirmedRef.current = true
			setPaymentStatus("paid")
			setPixMessage("Pagamento concluido. Seus conteudos foram liberados.")
			setPixCopied(false)
			setShowCardMaintenance(false)
		}

		window.addEventListener(Const_cartClearedEventName, Function_handleCartCleared)
		window.addEventListener(Const_paymentPaidEventName, Function_handlePaymentPaid)

		return () => {
			window.removeEventListener(Const_cartClearedEventName, Function_handleCartCleared)
			window.removeEventListener(Const_paymentPaidEventName, Function_handlePaymentPaid)
		}
	}, [Function_clearCartOnStorageAndState, Function_clearPaymentTimers, isOrderedUuid])

	useEffect(() => {
		if (!isPixModalOpen || isPaymentStep !== "pix_payment" || !isOrderedUuid || !isPaymentCreatedAt || isPaymentStatus === "paid") {
			return
		}

		let isCancelled = false

		const Function_checkPaymentStatus = async (): Promise<void> => {
			if (isCancelled || isPaymentConfirmedRef.current) {
				return
			}
			if (Date.now() - isPaymentCreatedAt > Const_pendingPaymentMaxAgeMs) {
				Function_clearPaymentTimers()
				setPaymentStatus("idle")
				setOrderedUuid("")
				setPaymentCreatedAt(0)
				setPixMessage("Essa cobranca expirou. Gere uma nova cobranca para continuar.")
				return
			}

			const Const_isPaid = await Function_fetchPaymentStatus(isOrderedUuid)
			if (isCancelled || isPaymentConfirmedRef.current) {
				return
			}

			if (Const_isPaid) {
				await Function_finalizeSuccessfulPayment()
			}
		}

		Function_checkPaymentStatus().catch(() => undefined)
		const Const_intervalId = window.setInterval(() => {
			Function_checkPaymentStatus().catch(() => undefined)
		}, Const_paymentPollIntervalMs)
		isPaymentPollIntervalRef.current = Const_intervalId

		return () => {
			isCancelled = true
			window.clearInterval(Const_intervalId)
			if (isPaymentPollIntervalRef.current === Const_intervalId) {
				isPaymentPollIntervalRef.current = null
			}
		}
	}, [Function_clearPaymentTimers, Function_fetchPaymentStatus, Function_finalizeSuccessfulPayment, isOrderedUuid, isPaymentCreatedAt, isPaymentStatus, isPixModalOpen, isPaymentStep])

	if (!isSession || isPageLoading) {
		return (
			<div className="min-h-[100vh] w-full flex items-center justify-center">
				<Spinner size="lg" />
			</div>
		)
	}

	return (
		<>
			<header>
				<Component_HeaderIdChatbotContentServer value={{ isInfUser: { user_uuid: isSession.student.student_uuid } }} />
			</header>

			<main className="mx-auto mt-[74px] w-full max-w-[980px] px-[10px] pb-[260px] pt-4">
				<div className="mb-4 flex flex-col gap-2 items-center md:items-end">
					<Button
						color="default"
						variant="bordered"
						className="w-full max-w-[420px] md:w-auto font-semibold border-default-400 bg-default-100 text-default-900 active:bg-default-500 active:text-white"
						startContent={<ArrowLeft size={18} />}
						isLoading={isNavigationLoadingTarget === "biblioteca"}
						isDisabled={!!isNavigationLoadingTarget}
						onClick={() => Function_navigateWithFeedback("/painel/biblioteca", "biblioteca")}
					>
						Voltar para Biblioteca
					</Button>
				</div>

				{isPageError ? (
					<div className="mb-4 rounded-xl border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700">
						{isPageError}
					</div>
				) : null}

				<div className="mb-3 text-sm font-semibold text-default-700">
					{isCartArray.length === 1 ? "Conteúdo do carrinho:" : "Conteúdos do carrinho:"}
				</div>

				{isCartLoading ? (
					<div className="rounded-2xl border border-default-200 bg-background py-14 sm:py-16 flex items-center justify-center">
						<Spinner />
					</div>
				) : isCartArray.length <= 0 ? (
					<div className="rounded-2xl border border-default-200 bg-background py-14 sm:py-16 text-center px-4">
						<p className="text-base font-medium text-default-700">
							Seu carrinho está vazio.
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-3">
						{isCartArray.map((Let_contentSingle) => {
							const Const_isRemovingThisContent = isRemoveLoadingUuid === Let_contentSingle.content_uuid
							const Const_canOpenPreview = !!Let_contentSingle.preview_file_uuid_content || !!Let_contentSingle.full_file_uuid_content
							const Const_hasDiscountTag = (
								typeof Let_contentSingle.old_price_content === "number" &&
								Let_contentSingle.old_price_content > 0 &&
								Let_contentSingle.old_price_content !== Let_contentSingle.current_price_content
							)

							const Function_handleOpenPreview = (): void => {
								if (!Const_canOpenPreview || isRemoveLoadingUuid || isNavigationLoadingTarget) {
									return
								}

								Function_openPreview(Let_contentSingle).catch(() => {
									setPageError("Não foi possível abrir a prévia desse conteúdo agora.")
								})
							}

							return (
								<div
									key={Let_contentSingle.content_uuid}
									className={`relative rounded-md border border-default-400 pt-2.5 pb-4 px-2.5 transition-colors bg-default-100/50 ${
										Const_canOpenPreview
											? `cursor-pointer ${isPressedCartCardUuid === Let_contentSingle.content_uuid ? "bg-default-300 border-default-500" : "bg-default-100/50"}`
											: "bg-default-100/50"
									}`}
									role={Const_canOpenPreview ? "button" : undefined}
									tabIndex={Const_canOpenPreview ? 0 : -1}
									onPointerDown={(Parameter_event) => {
										const Const_target = Parameter_event.target as HTMLElement | null
										if (Const_target?.closest("button")) {
											return
										}

										setPressedCartCardUuid(Let_contentSingle.content_uuid)
									}}
									onPointerUp={() => setPressedCartCardUuid("")}
									onPointerCancel={() => setPressedCartCardUuid("")}
									onPointerLeave={() => setPressedCartCardUuid("")}
									onClick={(Parameter_event) => {
										const Const_target = Parameter_event.target as HTMLElement | null
										if (Const_target?.closest("button")) {
											return
										}

										Function_handleOpenPreview()
									}}
									onKeyDown={(Parameter_event) => {
										if (!Const_canOpenPreview) {
											return
										}

										if (Parameter_event.key === "Enter" || Parameter_event.key === " ") {
											Parameter_event.preventDefault()
											Function_handleOpenPreview()
										}
									}}
								>
									<Button
										isIconOnly
										size="md"
										variant="solid"
										aria-label="Remover do carrinho"
										className="absolute -right-1 -top-1 z-10 h-7 w-7 min-w-7 rounded-full bg-new-tertiary text-white shadow-sm active:bg-new-tertiary-700"
										isLoading={Const_isRemovingThisContent}
										isDisabled={!!isRemoveLoadingUuid || !!isNavigationLoadingTarget}
										onClick={(Parameter_event) => {
											Parameter_event.stopPropagation()
											Function_removeCartItem(Let_contentSingle).catch(() => {
												setPageError("Não foi possível remover esse conteúdo agora.")
											})
										}}
									>
										<X size={15} strokeWidth={3} />
									</Button>

									<p className="text-base font-semibold leading-5 text-default-900 break-words">
										{Let_contentSingle.name_content}
									</p>
									{/* <div className="mt-2">
										<span className={`inline-flex min-h-8 items-center rounded-full px-3 text-sm font-medium ${
											Let_contentSingle.verified_content === 1
												? "bg-success-100 text-success-700"
												: "bg-danger-100 text-danger-700"
										}`}>
											{Let_contentSingle.verified_content === 1
												? "Verificado"
												: "Não verificado"}
										</span>
									</div> */}

									<div className="mt-1.5 flex flex-wrap gap-2 items-baseline">
										{Const_hasDiscountTag ? (
											<span className="text-sm font-medium text-new-tertiary line-through">
												{Function_formatCurrencyBRL(Let_contentSingle.old_price_content as number)}
											</span>
										) : null}
										<span className="text-xl font-bold leading-none text-new-secondary">
											{Function_formatCurrencyBRL(Let_contentSingle.current_price_content)}
										</span>
									</div>
								</div>
							)
						})}
					</div>
				)}
			</main>

			<div className="fixed inset-x-0 bottom-[max(18px,env(safe-area-inset-bottom))] z-20 px-[10px]">
				<div className="mx-auto w-full max-w-[980px] rounded-2xl border border-default-300 bg-background shadow-lg">
					<div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:justify-between">
						<div className="min-w-0">
							<div className="text-xs font-semibold tracking-wide text-default-500">
								Valor total
							</div>
							<div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 items-baseline">
								{isCartHasDiscount ? (
									<div className="text-base font-medium text-new-tertiary line-through">
										{Function_formatCurrencyBRL(isCartOldTotalAmount)}
									</div>
								) : null}
								<div className="text-2xl font-bold leading-none text-new-secondary">
									{Function_formatCurrencyBRL(isCartTotalAmount)}
								</div>
							</div>
							<div className="mt-1 text-sm text-default-600">
								{isCartContentLabel}
							</div>
						</div>

						<Button
							size="lg"
							variant="solid"
							className={isCartArray.length <= 0
								? "w-full min-h-12 px-5 text-base font-semibold bg-default-300 text-default-700 cursor-not-allowed active:bg-default-300 sm:w-auto"
								: "w-full min-h-12 px-6 text-base font-semibold bg-new-secondary text-white active:bg-new-secondary-700 sm:w-auto"}
							startContent={<LockOpen size={18} />}
							isDisabled={isCartArray.length <= 0}
							onClick={Function_openCheckoutModal}
						>
							{isUnlockButtonLabel}
						</Button>
					</div>
				</div>
			</div>

			<Component_ContentViewerModalClient
				isOpen={isViewerModalOpen}
				onClose={Function_closePreviewModal}
				ownerAlias={Function_getStudentAlias(isViewerItem?.student_uuid_content || "")}
				isLoading={isViewerLoading}
				fileUrl={isViewerFileUrl}
				isHtmlFile={isViewerHtmlFile}
				iframeRef={isViewerIframeRef}
				onIframeLoad={Function_handleViewerIframeLoad}
				iframeHeightPx={isViewerIframeHeightPx}
				errorMessage={isViewerError}
				reportContentUuid={isViewerItem?.content_uuid || ""}
			/>

			<Modal
				isOpen={isPixModalOpen}
				onOpenChange={Function_handlePaymentModalOpenChange}
				placement="center"
				backdrop="blur"
				size="full"
				classNames={{
					base: "!rounded-lg h-[100dvh] md:h-auto md:min-h-[500px] md:max-w-2xl md:rounded-3xl !shadow-2xl",
					closeButton: "hover:bg-default-100 active:bg-default-200"
				}}
			>
				<ModalContent>
					{(onClosePayment) => (
						<>
							{isPaymentStep === "method_selection" ? (
									<ModalBody className="gap-6 pt-6 pb-40 md:py-10 flex flex-col justify-start">
									<div className="flex flex-col gap-6 w-full mx-auto">
										<div className="flex flex-col gap-2">
											<h2 className="text-xl font-bold leading-tight text-left">
												{isCheckoutHeadline}
											</h2>
											<div className="flex items-center justify-start gap-2 text-default-500 text-sm">
												<Calendar size={16} />
												<span className="font-medium">
													{isCartContentLabel} - {Function_formatCurrencyBRL(isCartTotalAmount)}
												</span>
											</div>
										</div>

											<div className="flex flex-col gap-3">
													<Button
														className="h-20 px-4 justify-between items-center bg-primary-50 border-1 border-primary-200 active:bg-primary-200"
														variant="flat"
														color="primary"
														isDisabled={isPixGenerating}
														onPress={() => {
														Function_handlePixPayment().catch(() => {
															setPixMessage("Não foi possível gerar o Pix agora.")
														})
													}}
												>
												<div className="flex items-center gap-4">
													<div className="p-2.5 rounded-full bg-white text-primary shadow-sm">
														<QrCode size={24} />
													</div>
													<div className="flex flex-col items-start gap-0.5">
														<span className="text-lg font-bold text-primary-900">Pix (Instantaneo)</span>
														<span className="text-xs font-medium text-primary-600">Liberacao imediata</span>
													</div>
												</div>
											</Button>

													<Button
														className={`px-4 border-1 justify-start active:bg-warning-200 whitespace-normal [&>span]:!whitespace-normal [&>span]:w-full [&>span]:!items-start ${isShowCardMaintenance
															? "h-[164px] items-start py-4 bg-warning-50 border-warning-200"
															: "h-20 items-center bg-warning-50 border-warning-200"}`}
													variant="flat"
													color="warning"
													isLoading={isPixGenerating}
													isDisabled={isPixGenerating}
													onPress={() => {
														Function_generateCardCredit().catch(() => {
															setPixMessage("Nao foi possivel abrir o pagamento por cartao agora.")
														})
													}}
												>
													<div className="flex items-start gap-4 w-full">
														<div className={`p-2.5 rounded-full bg-white shadow-sm ${isShowCardMaintenance ? "text-warning-600" : "text-default-500"}`}>
															<CreditCard size={24} />
														</div>
															<div className="min-w-0 flex flex-col items-start gap-0.5 text-left whitespace-normal">
															<span className={`text-lg font-bold ${isShowCardMaintenance ? "text-warning-800" : "text-default-700"}`}>
																Cartao de Credito
															</span>
															{isShowCardMaintenance ? (
																<>
																	<span className="text-sm font-semibold text-warning-800">
																		Opcao em manutencao
																	</span>
																		<p className="text-xs text-warning-700 leading-relaxed whitespace-normal break-words">
																		Notamos falhas no pagamento por cartao e pausamos essa opcao por enquanto.
																		Use o <span className="font-bold">Pix</span> ate resolvermos. Obrigado pela compreensao!
																	</p>
																</>
															) : (
																<span className="text-xs font-medium text-default-500">
																	Ate 6x sem juros
																</span>
															)}
														</div>
													</div>
												</Button>
											</div>
										</div>
									</ModalBody>
							) : (
								<>
									<ModalHeader className="flex flex-col gap-1 pb-0">
										<div className="flex flex-col items-center gap-0">
											<span className="text-sm font-semibold text-default-500 uppercase tracking-wider">Beneficiário</span>
											<span className="text-lg font-bold text-default-900">49.835.763 Rafael Silva</span>
										</div>
									</ModalHeader>
									<ModalBody className="pt-6 md:py-10 flex flex-col justify-center">
										<div className="flex flex-col items-center gap-6 justify-center h-full">
											{isPaymentCompleted ? (
												<div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
													<div className="flex h-18 w-18 items-center justify-center rounded-full bg-success-100 text-success-600 shadow-sm">
														<CheckCircle2 size={36} />
													</div>
													<div className="flex flex-col gap-2">
														<h3 className="text-2xl font-bold text-success-700">
															Pagamento concluído
														</h3>
														<p className="max-w-[340px] text-sm text-default-600">
															Seus conteúdos foram liberados, o carrinho foi limpo e a biblioteca será atualizada.
														</p>
													</div>
													<div className="rounded-2xl border border-success-200 bg-success-50 px-4 py-3 text-sm font-semibold text-success-700">
														Atualizando sua biblioteca agora
													</div>
												</div>
											) : isPixGenerating ? (
												<div className="flex flex-col items-center justify-center py-10 gap-4">
													<Spinner size="lg" color="primary" />
													<p className="text-sm text-default-500 font-medium animate-pulse">
														Gerando QR Code Pix...
													</p>
												</div>
											) : (
												<div className="flex flex-col items-center justify-center w-full gap-6">
													<div className="p-4 bg-white rounded-xl border-2 border-primary/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
														{isPixCode ? <QRCode value={isPixCode} size={200} /> : (
															<div className="h-[200px] w-[200px] flex items-center justify-center text-center text-sm text-default-500 px-4">
																Não foi possível gerar o QR Code.
															</div>
														)}
													</div>

													<div className="w-full flex flex-col gap-3">
														<Snippet
															symbol=""
															codeString={isPixCode}
															hideCopyButton
															className="w-full bg-default-100 border border-default-200"
															classNames={{
																pre: "font-mono text-xs text-default-600 truncate text-center",
																base: "p-4 px-7 rounded-xl justify-center"
															}}
														>
															<span className="text-xs text-default-500 truncate max-w-[400px] md:max-w-full block text-center mx-auto">
																{isPixCode || "Código Pix indisponível no momento"}
															</span>
														</Snippet>

														<Button
															size="lg"
															className={`w-full h-14 font-medium text-base transition-all duration-300 ${isPixCopied ? "bg-success text-white shadow-success/20 active:bg-success-700" : "bg-primary text-white shadow-primary/20 active:bg-primary-700"}`}
															variant="shadow"
															startContent={isPixCopied ? <CheckCircle2 size={22} /> : <Copy size={22} />}
															onPress={Function_copyPix}
															isDisabled={!isPixCode}
														>
															{isPixCopied ? "Código Copiado!" : "Copiar Código Pix"}
														</Button>

														{isPixMessage ? (
															<div className="text-center text-xs text-default-500">
																{isPixMessage}
															</div>
														) : null}
													</div>
												</div>
											)}
										</div>
									</ModalBody>
								</>
							)}
							<ModalFooter className="pt-2 pb-6 md:pb-10">
								<Button
									color={isPaymentCompleted ? "success" : "danger"}
									variant="flat"
									onPress={isPaymentCompleted ? Function_openLibraryAfterPayment : onClosePayment}
									className={`h-12 font-medium transition-colors ${isPaymentCompleted ? "bg-success-50 text-success hover:bg-success-100 hover:text-success-700" : "bg-danger-50 text-danger hover:bg-danger-100 hover:text-danger-600"}`}
									fullWidth
								>
									{isPaymentCompleted ? "Ir para Biblioteca" : "Cancelar Compra"}
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</>
	)
}
