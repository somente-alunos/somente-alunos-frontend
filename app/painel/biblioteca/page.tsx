"use client"

import { PageContext, Type_panelSession } from "@/app/painel/layout_context"
import { Component_ContentViewerModalClient } from "@/component/shared/content_viewer_modal_client"
import {
	Type_backendCollege,
	Type_backendContentBiblioteca,
	Type_backendCourse
} from "@/env"
import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Spinner
} from "@nextui-org/react"
import {
	ArrowLeft,
	ArrowRight,
	Building2,
	Check,
	Clock3,
	Eye,
	FileText,
	FilePlus2,
	GraduationCap,
	LibraryBig,
	ShoppingCart,
	Trophy
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"

const Const_studentSessionStorageKey = "somente_alunos_student_session_v1"
const Const_featuredTimeWindowMs = 36 * 60 * 60 * 1000
const Const_oldContentInitialVisibleCount = 5
const Const_oldContentLoadMoreStep = 3

type Type_libraryDisplayContent = {
	content_uuid: string;
	content_update: string;
	name_content: string;
	owner_student_uuid: string;
	old_price_content: number;
	current_price_content: number;
	verified_content: 0 | 1;
	is_available_now: boolean;
	prevision_iso: string | null;
	is_acquired_content: boolean;
	has_preview_file: boolean;
	has_full_file: boolean;
	raw_content: Type_backendContentBiblioteca | null;
}

function Function_saveSessionOnStorage(Parameter_session: Type_panelSession): void {
	if (typeof localStorage === "undefined") {
		return
	}

	localStorage.setItem(Const_studentSessionStorageKey, JSON.stringify(Parameter_session))
}

function Function_moveSuggestionToPosition<ParameterType_item>(
	Parameter_array: ParameterType_item[],
	Parameter_findSuggestion: (Parameter_single: ParameterType_item) => boolean,
	Parameter_indexTarget: number
): ParameterType_item[] {
	if (Parameter_array.length <= 1) {
		return Parameter_array
	}

	const Const_indexSuggestion = Parameter_array.findIndex(Parameter_findSuggestion)
	if (Const_indexSuggestion < 0) {
		return Parameter_array
	}

	const Const_indexTarget = Math.max(0, Math.min(Parameter_indexTarget, Parameter_array.length - 1))
	if (Const_indexSuggestion === Const_indexTarget) {
		return Parameter_array
	}

	const Const_array = [...Parameter_array]
	const [Const_itemSuggestion] = Const_array.splice(Const_indexSuggestion, 1)
	Const_array.splice(Const_indexTarget, 0, Const_itemSuggestion)
	return Const_array
}

function Function_renderInstitutionVisual(
	Parameter_name: string,
	Parameter_svgOrUrl: string | null,
	Parameter_kind: "college" | "course"
): JSX.Element {
	const Const_value = typeof Parameter_svgOrUrl === "string" ? Parameter_svgOrUrl.trim() : ""

	if (!Const_value) {
		return (
			<div className="text-default-500">
				{Parameter_kind === "college" ? <Building2 size={20} /> : <GraduationCap size={20} />}
			</div>
		)
	}

	if (Const_value.startsWith("<svg")) {
		return (
			<div
				className="h-6 w-6 text-default-700 [&_svg]:h-6 [&_svg]:w-6"
				dangerouslySetInnerHTML={{ __html: Const_value }}
			/>
		)
	}

	return (
		<img
			src={Const_value}
			alt={Parameter_name}
			className="h-6 w-6 object-contain"
		/>
	)
}

function Function_formatCurrencyBRL(Parameter_value: number): string {
	return `R$ ${Parameter_value.toFixed(2).replace(".", ",")}`
}

function Function_getStudentAlias(Parameter_studentUuid: string): string {
	return `@${(Parameter_studentUuid || "").split("-")[0] || "anonimo"}`
}

function Function_getAvailabilityLabel(
	Parameter_content: Type_libraryDisplayContent,
	Parameter_nowMs: number
): string {
	if (!Parameter_content.prevision_iso) {
		return "Disponivel em breve"
	}

	const Const_previsionMs = new Date(Parameter_content.prevision_iso).getTime()
	const Const_isInvalidDate = Number.isNaN(Const_previsionMs)
	if (Const_isInvalidDate) {
		return "Disponivel em breve"
	}

	const Const_diffMs = Const_previsionMs - Parameter_nowMs
	if (Const_diffMs <= 0) {
		return "Disponivel em breve"
	}

	const Const_hoursLeft = Math.max(1, Math.ceil(Const_diffMs / (1000 * 60 * 60)))
	return `Disponivel em ${Const_hoursLeft} horas`
}

function Function_getContentUpdateMs(Parameter_content: Type_libraryDisplayContent): number {
	const Const_updateMs = new Date(Parameter_content.content_update).getTime()
	if (Number.isNaN(Const_updateMs)) {
		return 0
	}

	return Const_updateMs
}

function Function_sortLibrarySectionContentArray(
	Parameter_contentArray: Type_libraryDisplayContent[]
): Type_libraryDisplayContent[] {
	return [...Parameter_contentArray].sort((Parameter_previous, Parameter_next) => {
		if (Parameter_previous.is_acquired_content !== Parameter_next.is_acquired_content) {
			return Parameter_previous.is_acquired_content ? -1 : 1
		}

		if (Parameter_previous.verified_content !== Parameter_next.verified_content) {
			return Parameter_next.verified_content - Parameter_previous.verified_content
		}

		return Function_getContentUpdateMs(Parameter_next) - Function_getContentUpdateMs(Parameter_previous)
	})
}

export default function Page_Library(): JSX.Element {
	const Const_router = useRouter()
	const {
		session: isSession,
		setSession,
		libraryContentArray: isLibraryContentArray,
		refreshLibrary
	} = useContext(PageContext)

	const [isPageLoading, setPageLoading] = useState(true)
	const [isNavigationLoadingTarget, setNavigationLoadingTarget] = useState("")
	const [isCartActionLoadingUuid, setCartActionLoadingUuid] = useState("")

	const [isSelectionModalOpen, setSelectionModalOpen] = useState(false)
	const [isSelectionModalMode, setSelectionModalMode] = useState<"mandatory" | "manual">("mandatory")
	const [isSelectionModalStep, setSelectionModalStep] = useState<"college" | "course">("college")
	const [isSelectionStepLoading, setSelectionStepLoading] = useState(false)
	const [isSelectionModalError, setSelectionModalError] = useState("")

	const [isCollegeArray, setCollegeArray] = useState<Type_backendCollege[]>([])
	const [isCourseArray, setCourseArray] = useState<Type_backendCourse[]>([])
	const [isCourseArrayCollegeUuid, setCourseArrayCollegeUuid] = useState("")
	const [isSelectedCollegeUuid, setSelectedCollegeUuid] = useState("")
	const [isSelectedCourseUuid, setSelectedCourseUuid] = useState("")

	const [isViewerModalOpen, setViewerModalOpen] = useState(false)
	const [isViewerLoading, setViewerLoading] = useState(false)
	const [isViewerError, setViewerError] = useState("")
	const [isViewerItem, setViewerItem] = useState<Type_backendContentBiblioteca | null>(null)
	const [isViewerFileUrl, setViewerFileUrl] = useState("")
	const [isViewerFileMimeType, setViewerFileMimeType] = useState("")
	const [isViewerIframeHeightPx, setViewerIframeHeightPx] = useState(0)
	const [isViewerDownloadLoading, setViewerDownloadLoading] = useState(false)
	const [isPressedLibraryCardUuid, setPressedLibraryCardUuid] = useState("")
	const [isOldContentVisibleCount, setOldContentVisibleCount] = useState(Const_oldContentInitialVisibleCount)

	const isViewerFileUrlRef = useRef("")
	const isViewerIframeRef = useRef<HTMLIFrameElement | null>(null)

	const isNeedSuggestionFlow = useMemo(() => {
		return !!isSession?.student?.is_suggested_information_student
	}, [isSession])

	const isShouldPreselectBySession = useMemo(() => {
		if (!isSession) {
			return false
		}

		return !isSession.student.is_suggested_information_student
	}, [isSession])

	const isShouldPutSuggestionSecond = useMemo(() => {
		return !!isSession?.student?.is_suggested_information_student
	}, [isSession])

	const isDisplayCollegeArray = useMemo(() => {
		if (!isSession || !isSession.student.college_uuid_student) {
			return isCollegeArray
		}

		return Function_moveSuggestionToPosition(
			isCollegeArray,
			(Parameter_single) => Parameter_single.college_uuid === isSession.student.college_uuid_student,
			0
		)
	}, [isCollegeArray, isSession])

	const isDisplayCourseArray = useMemo(() => {
		if (
			!isSession ||
			!isSession.student.course_uuid_student
		) {
			return isCourseArray
		}

		return Function_moveSuggestionToPosition(
			isCourseArray,
			(Parameter_single) => Parameter_single.course_uuid === isSession.student.course_uuid_student,
			0
		)
	}, [isCourseArray, isSession])

	const isLibraryContentDisplayArray = useMemo(() => {
		return isLibraryContentArray.map((Parameter_single) => ({
			content_uuid: Parameter_single.content_uuid,
			content_update: Parameter_single.content_update,
			name_content: Parameter_single.name_content,
			owner_student_uuid: Parameter_single.student_uuid_content,
			old_price_content: Parameter_single.old_price_content ?? Parameter_single.current_price_content,
			current_price_content: Parameter_single.current_price_content,
			verified_content: Parameter_single.verified_content,
			is_available_now: Parameter_single.isAcquiredContent
				? !!Parameter_single.full_file_uuid_content
				: !!Parameter_single.preview_file_uuid_content,
			prevision_iso: Parameter_single.prevision_content || null,
			is_acquired_content: Parameter_single.isAcquiredContent,
			has_preview_file: !!Parameter_single.preview_file_uuid_content,
			has_full_file: !!Parameter_single.full_file_uuid_content,
			raw_content: Parameter_single
		}))
	}, [isLibraryContentArray])

	const isLibrarySummaryCollegeName = useMemo(() => {
		const Const_collegeUuid = isSelectedCollegeUuid || isSession?.student?.college_uuid_student || ""
		const Const_collegeFound = isCollegeArray.find((Parameter_single) => Parameter_single.college_uuid === Const_collegeUuid)
		return Const_collegeFound?.name_college || "Não definido"
	}, [isSelectedCollegeUuid, isSession, isCollegeArray])

	const isLibrarySummaryCourseName = useMemo(() => {
		const Const_courseUuid = isSelectedCourseUuid || isSession?.student?.course_uuid_student || ""
		const Const_courseFound = isCourseArray.find((Parameter_single) => Parameter_single.course_uuid === Const_courseUuid)
		return Const_courseFound?.name_course || "Não definido"
	}, [isSelectedCourseUuid, isSession, isCourseArray])

	const isLibraryGroupedContent = useMemo(() => {
		const Const_featuredArray: Type_libraryDisplayContent[] = []
		const Const_oldArray: Type_libraryDisplayContent[] = []
		const Const_featuredThresholdMs = Date.now() - Const_featuredTimeWindowMs

		for (const Let_contentSingle of isLibraryContentDisplayArray) {
			const Const_updateMs = Function_getContentUpdateMs(Let_contentSingle)
			if (Const_updateMs > 0 && Const_updateMs >= Const_featuredThresholdMs) {
				Const_featuredArray.push(Let_contentSingle)
			}
			else {
				Const_oldArray.push(Let_contentSingle)
			}
		}

		return {
			featured: Function_sortLibrarySectionContentArray(Const_featuredArray),
			old: Function_sortLibrarySectionContentArray(Const_oldArray)
		}
	}, [isLibraryContentDisplayArray])

	const isLibraryOldVisibleContentArray = useMemo(() => {
		return isLibraryGroupedContent.old.slice(0, isOldContentVisibleCount)
	}, [isLibraryGroupedContent.old, isOldContentVisibleCount])

	const isHasMoreOldContent = isLibraryGroupedContent.old.length > isOldContentVisibleCount

	const isViewerHtmlFile = useMemo(() => {
		const Const_mimeType = isViewerFileMimeType.trim().toLowerCase()
		return Const_mimeType.includes("text/html") || Const_mimeType.includes("application/xhtml+xml")
	}, [isViewerFileMimeType])

	const Function_clearViewerFileUrl = useCallback(() => {
		if (isViewerFileUrlRef.current) {
			URL.revokeObjectURL(isViewerFileUrlRef.current)
			isViewerFileUrlRef.current = ""
		}
		setViewerFileUrl("")
		setViewerFileMimeType("")
		setViewerIframeHeightPx(0)
	}, [])

	const Function_fetchCollegeArray = useCallback(async (): Promise<Type_backendCollege[]> => {
		const Const_response = await fetch(`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/get/student-or-admin/faculdade/todas`, {
			credentials: "include"
		})
		if (!Const_response.ok) {
			if (Const_response.status === 451) {
				Const_router.push("/entrar")
				return []
			}

			throw new Error("Falha ao buscar faculdades")
		}

		const Const_responseBody = await Const_response.json() as { collegeArray?: Type_backendCollege[] }
		return Array.isArray(Const_responseBody.collegeArray) ? Const_responseBody.collegeArray : []
	}, [Const_router])

	const Function_fetchCourseArray = useCallback(async (Parameter_collegeUuid: string): Promise<Type_backendCourse[]> => {
		const Const_response = await fetch(
			`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/get/student-or-admin/curso/especifico?college_uuid_course=${encodeURIComponent(Parameter_collegeUuid)}`,
			{ credentials: "include" }
		)
		if (!Const_response.ok) {
			if (Const_response.status === 451) {
				Const_router.push("/entrar")
				return []
			}

			throw new Error("Falha ao buscar cursos")
		}

		const Const_responseBody = await Const_response.json() as { courseArray?: Type_backendCourse[] }
		return Array.isArray(Const_responseBody.courseArray) ? Const_responseBody.courseArray : []
	}, [Const_router])

	const Function_loadCourseArrayByCollege = useCallback(async (
		Parameter_collegeUuid: string,
		Parameter_preferredCourseUuid?: string
	): Promise<Type_backendCourse[]> => {
		if (!Parameter_collegeUuid) {
			setCourseArray([])
			setCourseArrayCollegeUuid("")
			setSelectedCourseUuid("")
			return []
		}

		const Const_courseArray = await Function_fetchCourseArray(Parameter_collegeUuid)
		setCourseArray(Const_courseArray)
		setCourseArrayCollegeUuid(Parameter_collegeUuid)

		const Const_preferredCourse = Parameter_preferredCourseUuid || ""
		const Const_hasPreferredCourse = Const_courseArray.some(
			(Parameter_single) => Parameter_single.course_uuid === Const_preferredCourse
		)

		if (Const_hasPreferredCourse) {
			setSelectedCourseUuid(Const_preferredCourse)
		}
		else {
			setSelectedCourseUuid("")
		}

		return Const_courseArray
	}, [Function_fetchCourseArray])

	const Function_openSelectionModal = useCallback((Parameter_mode: "mandatory" | "manual") => {
		if (!isSession) {
			return
		}

		const Const_shouldPreselectBySession = !isSession.student.is_suggested_information_student
		setSelectionModalMode(Parameter_mode)
		setSelectionModalStep("college")
		setSelectionStepLoading(false)
		setSelectionModalError("")
		setSelectedCollegeUuid(Const_shouldPreselectBySession ? (isSession.student.college_uuid_student || "") : "")
		setSelectedCourseUuid(Const_shouldPreselectBySession ? (isSession.student.course_uuid_student || "") : "")
		setSelectionModalOpen(true)
	}, [isSession])

	const Function_closeSelectionModal = useCallback(() => {
		if (isSelectionModalMode === "mandatory") {
			return
		}

		setSelectionModalOpen(false)
		setSelectionModalStep("college")
		setSelectionModalError("")
	}, [isSelectionModalMode])

	const Function_navigateWithFeedback = useCallback((Parameter_route: string, Parameter_target: string) => {
		if (isNavigationLoadingTarget) {
			return
		}

		setNavigationLoadingTarget(Parameter_target)
		Const_router.push(Parameter_route)
	}, [Const_router, isNavigationLoadingTarget])

	const Function_addContentToCartAndGo = useCallback(async (Parameter_content: Type_backendContentBiblioteca | null): Promise<void> => {
		if (!Parameter_content || isCartActionLoadingUuid || isNavigationLoadingTarget) {
			return
		}

		try {
			setViewerError("")
			setCartActionLoadingUuid(Parameter_content.content_uuid)

			const Const_response = await fetch(`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/patch/student/carrinho`, {
				method: "PATCH",
				headers: { "content-type": "application/json; charset=utf-8" },
				credentials: "include",
				body: JSON.stringify({
					content: { content_uuid: Parameter_content.content_uuid },
					action: "add"
				})
			})

			if (!Const_response.ok) {
				if (Const_response.status === 451) {
					Const_router.push("/entrar")
					return
				}

				throw new Error("Falha ao adicionar conteúdo no carrinho")
			}

			setNavigationLoadingTarget("carrinho")
			Const_router.push("/carrinho")
		}
		catch {
			setViewerError("Não foi possível adicionar esse conteúdo no carrinho agora.")
		}
		finally {
			setCartActionLoadingUuid("")
		}
	}, [Const_router, isCartActionLoadingUuid, isNavigationLoadingTarget])

	const Function_loadViewerFile = useCallback(async (Parameter_content: Type_backendContentBiblioteca): Promise<void> => {
		setViewerLoading(true)
		setViewerError("")

		const Const_response = await fetch(
			`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/get/student/conteúdo/file?content_uuid=${encodeURIComponent(Parameter_content.content_uuid)}`,
			{ credentials: "include" }
		)
		if (!Const_response.ok) {
			if (Const_response.status === 451) {
				Const_router.push("/entrar")
				return
			}

			throw new Error("Falha ao carregar arquivo do conteúdo")
		}

		const Const_blob = await Const_response.blob()
		Function_clearViewerFileUrl()
		const Const_blobUrl = URL.createObjectURL(Const_blob)
		isViewerFileUrlRef.current = Const_blobUrl
		setViewerFileUrl(Const_blobUrl)
		setViewerFileMimeType((Const_response.headers.get("content-type") || Const_blob.type || "").trim().toLowerCase())
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
			let Let_nextHeight = Math.max(
				Const_body?.scrollHeight || 0,
				Const_root?.scrollHeight || 0,
				Const_body?.offsetHeight || 0,
				Const_root?.offsetHeight || 0
			)

			if (Const_root?.offsetHeight >= 3000) {
				Let_nextHeight = Const_root?.offsetHeight + 100
			}

			if (Let_nextHeight > 0) {
				setViewerIframeHeightPx(Let_nextHeight)
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

	const Function_openViewer = useCallback(async (Parameter_content: Type_backendContentBiblioteca): Promise<void> => {
		try {
			setViewerItem(Parameter_content)
			setViewerModalOpen(true)
			await Function_loadViewerFile(Parameter_content)
		}
		catch {
			setViewerError("Não foi possível abrir o conteúdo agora.")
		}
		finally {
			setViewerLoading(false)
		}
	}, [Function_loadViewerFile])

	const Function_closeViewerModal = useCallback((): void => {
		setViewerModalOpen(false)
		setViewerItem(null)
		setViewerDownloadLoading(false)
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
		setOldContentVisibleCount(Const_oldContentInitialVisibleCount)
	}, [isLibraryGroupedContent.old.length])

	const isAutoRefreshBusyRef = useRef(false)

	const Function_refreshLibrarySilently = useCallback(async (): Promise<void> => {
		if (isAutoRefreshBusyRef.current || isNeedSuggestionFlow || isSelectionModalOpen) {
			return
		}

		try {
			isAutoRefreshBusyRef.current = true
			await refreshLibrary()
		}
		catch {
			// Ignora erro transitório para não interromper a experiência.
		}
		finally {
			isAutoRefreshBusyRef.current = false
		}
	}, [isNeedSuggestionFlow, isSelectionModalOpen, refreshLibrary])

	const Function_downloadViewerFile = useCallback(() => {
		if (!isViewerFileUrl || !isViewerItem || isViewerDownloadLoading) {
			return
		}

		try {
			setViewerDownloadLoading(true)
			const Const_isHtml = isViewerFileMimeType.includes("text/html") || isViewerFileMimeType.includes("application/xhtml+xml")
			const Const_isPdf = isViewerFileMimeType.includes("application/pdf")
			const Const_extension = Const_isHtml ? "html" : (Const_isPdf ? "pdf" : "bin")
			const Const_fileNameBase = isViewerItem.name_content
				.trim()
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/^-+|-+$/g, "")
			const Const_fileNameSafe = Const_fileNameBase || `conteudo-${isViewerItem.content_uuid.slice(0, 8)}`

			const Const_anchor = document.createElement("a")
			Const_anchor.href = isViewerFileUrl
			Const_anchor.download = `${Const_fileNameSafe}.${Const_extension}`
			document.body.appendChild(Const_anchor)
			Const_anchor.click()
			Const_anchor.remove()
		}
		finally {
			window.setTimeout(() => setViewerDownloadLoading(false), 250)
		}
	}, [isViewerDownloadLoading, isViewerFileMimeType, isViewerFileUrl, isViewerItem])

	const Function_handleContinueFromCollege = useCallback(async () => {
		if (!isSelectedCollegeUuid) {
			return
		}

		setSelectionModalError("")
		const Const_isCourseLoadedFromSelectedCollege = (
			isCourseArrayCollegeUuid === isSelectedCollegeUuid &&
			isCourseArray.length > 0
		)

		if (!Const_isCourseLoadedFromSelectedCollege) {
			try {
				setSelectionStepLoading(true)
				const Const_preferredCourse = (
					isShouldPreselectBySession && isSession?.student.college_uuid_student === isSelectedCollegeUuid
						? (isSession?.student.course_uuid_student || "")
						: ""
				)
				await Function_loadCourseArrayByCollege(isSelectedCollegeUuid, Const_preferredCourse)
			}
			catch {
				setSelectionModalError("Não foi possível carregar os cursos dessa faculdade.")
				return
			}
			finally {
				setSelectionStepLoading(false)
			}
		}
		else if (isShouldPreselectBySession && !isSelectedCourseUuid) {
			const Const_preferredCourse = (
				isSession?.student.college_uuid_student === isSelectedCollegeUuid
					? (isSession?.student.course_uuid_student || "")
					: ""
			)
			if (Const_preferredCourse && isCourseArray.some((Parameter_single) => Parameter_single.course_uuid === Const_preferredCourse)) {
				setSelectedCourseUuid(Const_preferredCourse)
			}
		}

		setSelectionModalStep("course")
	}, [
		isSelectedCollegeUuid,
		isCourseArrayCollegeUuid,
		isCourseArray,
		isSelectedCourseUuid,
		isSession,
		isShouldPreselectBySession,
		Function_loadCourseArrayByCollege
	])

	const Function_handleFinalizeSelection = useCallback(async () => {
		if (!isSession || !isSelectedCollegeUuid || !isSelectedCourseUuid) {
			return
		}

		try {
			setSelectionStepLoading(true)
			setSelectionModalError("")
			const Const_response = await fetch(`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/patch/student/confirma-faculdade-e-curso`, {
				method: "PATCH",
				headers: { "content-type": "application/json; charset=utf-8" },
				credentials: "include",
				body: JSON.stringify({
					college_uuid_student: isSelectedCollegeUuid,
					course_uuid_student: isSelectedCourseUuid
				})
			})
			if (!Const_response.ok) {
				throw new Error("Falha ao confirmar faculdade e curso")
			}

			const Const_newSession: Type_panelSession = {
				...isSession,
				student: {
					...isSession.student,
					college_uuid_student: isSelectedCollegeUuid,
					course_uuid_student: isSelectedCourseUuid,
					is_suggested_information_student: 0
				},
				collegeArray: isCollegeArray,
				courseArray: isCourseArray
			}
			setSession(Const_newSession)
			Function_saveSessionOnStorage(Const_newSession)
			setSelectionModalOpen(false)
			setSelectionModalStep("college")
		}
		catch {
			setSelectionModalError("Não foi possível salvar a faculdade e o curso.")
		}
		finally {
			setSelectionStepLoading(false)
		}
	}, [isSession, isSelectedCollegeUuid, isSelectedCourseUuid, isCollegeArray, isCourseArray, setSession])

	useEffect(() => {
		if (!isSession) {
			return
		}

		let Const_isMounted = true

		const Function_initialize = async () => {
			try {
				const Const_collegeSource = (
					isSession.collegeArray.length > 0
						? isSession.collegeArray
						: await Function_fetchCollegeArray()
				)
				if (!Const_isMounted) {
					return
				}

				setCollegeArray(Const_collegeSource)

				const Const_collegeUuidSession = isSession.student.college_uuid_student || ""
				const Const_courseUuidSession = isSession.student.course_uuid_student || ""

				setSelectedCollegeUuid(isShouldPreselectBySession ? Const_collegeUuidSession : "")
				setSelectedCourseUuid(isShouldPreselectBySession ? Const_courseUuidSession : "")

				if (Const_collegeUuidSession && isSession.courseArray.length > 0) {
					setCourseArray(isSession.courseArray)
					setCourseArrayCollegeUuid(Const_collegeUuidSession)
				}
				else if (Const_collegeUuidSession) {
					try {
						await Function_loadCourseArrayByCollege(
							Const_collegeUuidSession,
							isShouldPreselectBySession ? Const_courseUuidSession : ""
						)
					}
					catch {
						setCourseArray([])
						setCourseArrayCollegeUuid("")
					}
				}
				else {
					setCourseArray([])
					setCourseArrayCollegeUuid("")
				}

				if (isNeedSuggestionFlow) {
					Function_openSelectionModal("mandatory")
				}
			}
			catch {
				setViewerError("Não foi possível carregar os dados iniciais da biblioteca.")
			}
			finally {
				if (Const_isMounted) {
					setPageLoading(false)
				}
			}
		}

		Function_initialize()

		return () => {
			Const_isMounted = false
		}
	}, [
		isSession,
		isNeedSuggestionFlow,
		isShouldPreselectBySession,
		Function_fetchCollegeArray,
		Function_loadCourseArrayByCollege,
		Function_openSelectionModal
	])

	useEffect(() => {
		return () => {
			Function_clearViewerFileUrl()
		}
	}, [Function_clearViewerFileUrl])

	useEffect(() => {
		if (!isSession || isNeedSuggestionFlow) {
			return
		}

		const Function_refreshOnFocus = () => {
			Function_refreshLibrarySilently().catch(() => undefined)
		}

		const Function_refreshOnVisible = () => {
			if (document.visibilityState === "visible") {
				Function_refreshLibrarySilently().catch(() => undefined)
			}
		}

		const Const_intervalId = setInterval(() => {
			Function_refreshLibrarySilently().catch(() => undefined)
		}, 30000)

		window.addEventListener("focus", Function_refreshOnFocus)
		document.addEventListener("visibilitychange", Function_refreshOnVisible)

		return () => {
			clearInterval(Const_intervalId)
			window.removeEventListener("focus", Function_refreshOnFocus)
			document.removeEventListener("visibilitychange", Function_refreshOnVisible)
		}
	}, [isSession, isNeedSuggestionFlow, Function_refreshLibrarySilently])

	if (!isSession) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
				<Spinner size="lg" />
				<span className="text-default-500">Validando sessao...</span>
			</div>
		)
	}

	if (isPageLoading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
				<Spinner size="lg" />
				<span className="text-default-500">Carregando biblioteca...</span>
			</div>
		)
	}

	const Function_renderLibraryContentCard = (Let_contentSingle: Type_libraryDisplayContent): JSX.Element => {
		const Const_nowMs = Date.now()
		const Const_availabilityLabel = Function_getAvailabilityLabel(Let_contentSingle, Const_nowMs)
		const Const_canOpenFull = Let_contentSingle.is_acquired_content && Let_contentSingle.has_full_file
		const Const_canOpenPreview = !Let_contentSingle.is_acquired_content && Let_contentSingle.has_preview_file
		const Const_isUnavailable = !Const_canOpenPreview && !Const_canOpenFull
		const Const_isNonAcquiredAvailable = !Let_contentSingle.is_acquired_content && Const_canOpenPreview
		const Const_canOpenViewer = !!Let_contentSingle.raw_content && (Const_canOpenFull || Const_canOpenPreview)
		const Const_isLoadingThisContent = isViewerLoading && isViewerItem?.content_uuid === Let_contentSingle.content_uuid

		const Function_handleOpenViewer = (): void => {
			if (!Const_canOpenViewer || !Let_contentSingle.raw_content || Const_isLoadingThisContent) {
				return
			}

			Function_openViewer(Let_contentSingle.raw_content).catch(() => {
				setViewerError("Não foi possível abrir o conteúdo agora.")
			})
		}

		return (
			<div
				key={Let_contentSingle.content_uuid}
				className={`rounded-md border border-default-400 pt-2.5 pb-4 px-2.5 transition-colors bg-default-100/50 ${
					Const_canOpenViewer
						? `cursor-pointer ${isPressedLibraryCardUuid === Let_contentSingle.content_uuid ? "bg-default-300 border-default-500" : "bg-default-100/50"}`
						: "bg-default-100/50"
				}`}
				role={Const_canOpenViewer ? "button" : undefined}
				tabIndex={Const_canOpenViewer ? 0 : -1}
				onPointerDown={(Parameter_event) => {
					if (!Const_canOpenViewer) {
						return
					}

					const Const_target = Parameter_event.target as HTMLElement | null
					if (Const_target?.closest("button")) {
						return
					}

					setPressedLibraryCardUuid(Let_contentSingle.content_uuid)
				}}
				onPointerUp={() => setPressedLibraryCardUuid("")}
				onPointerCancel={() => setPressedLibraryCardUuid("")}
				onPointerLeave={() => setPressedLibraryCardUuid("")}
				onClick={Const_canOpenViewer ? Function_handleOpenViewer : undefined}
				onKeyDown={(Parameter_event) => {
					if (!Const_canOpenViewer) {
						return
					}

					if (Parameter_event.key === "Enter" || Parameter_event.key === " ") {
						Parameter_event.preventDefault()
						Function_handleOpenViewer()
					}
				}}
			>
				<div className="flex items-start gap-2">
					{/* <FileText size={20} className="mt-[1px] text-default-600" /> */}
					<div className="text-base font-semibold text-default-900">{Let_contentSingle.name_content}</div>
				</div>
				<div className="text-sm text-default-600">
					Compartilhado por {Function_getStudentAlias(Let_contentSingle.owner_student_uuid)}
				</div>

				{/* <div className="mt-2 flex flex-wrap items-center gap-2">
					<span className={`inline-flex min-h-8 items-center rounded-full px-3 text-sm font-medium ${
						Let_contentSingle.verified_content === 1
							? "bg-success-100 text-success-700"
							: "bg-danger-100 text-danger-700"
					}`}>
						{Let_contentSingle.verified_content === 1
							? "Verificado"
							: "Não verificado"}
					</span>

					{Const_isNonAcquiredAvailable && Let_contentSingle.old_price_content > 0 &&
					Let_contentSingle.old_price_content !== Let_contentSingle.current_price_content ? (
							<span className="inline-flex min-h-8 items-center rounded-full bg-default-100 px-3 text-sm text-default-500 line-through">
								{Function_formatCurrencyBRL(Let_contentSingle.old_price_content)}
							</span>
						) : null}

					{Const_isNonAcquiredAvailable ? (
						<span className="inline-flex min-h-8 items-center rounded-full bg-success-100 px-3 text-sm font-semibold text-success-700">
							{Function_formatCurrencyBRL(Let_contentSingle.current_price_content)}
						</span>
					) : null}

					{Const_isUnavailable ? (
						<span className="inline-flex min-h-8 items-center rounded-full bg-warning-100 px-3 text-sm font-medium text-warning-700">
							{Const_availabilityLabel}
						</span>
					) : null}
				</div> */}

				{Const_isNonAcquiredAvailable ? (
					<div className="mt-3.5 flex flex-wrap gap-2 items-baseline">
						{typeof Let_contentSingle.old_price_content === "number" &&
						Let_contentSingle.old_price_content > 0 &&
						Let_contentSingle.old_price_content !== Let_contentSingle.current_price_content ? (
							<span className="text-sm font-medium text-new-tertiary line-through">
								{Function_formatCurrencyBRL(Let_contentSingle.old_price_content as number)}
							</span>
						) : null}
						<span className="text-xl font-bold leading-none text-new-secondary">
							{Function_formatCurrencyBRL(Let_contentSingle.current_price_content)}
						</span>
					</div>
				) : null}

				<div className="mt-6 flex flex-wrap gap-2">
					{Const_canOpenPreview ? (
						<>
							<Button
								size="md"
								variant="solid"
								className="px-4 text-sm font-semibold bg-new-primary text-white active:bg-new-primary-700"
								startContent={<Eye size={18} />}
								isDisabled={Const_isLoadingThisContent}
								onClick={(Parameter_event) => {
									Parameter_event.stopPropagation()
									Function_handleOpenViewer()
								}}
							>
								Ver Prévia
							</Button>
							<Button
								size="md"
								variant="solid"
								className="px-4 text-sm font-semibold bg-new-tertiary text-white active:bg-new-tertiary-700"
								startContent={<ShoppingCart size={18} />}
								isLoading={isCartActionLoadingUuid === Let_contentSingle.content_uuid}
								isDisabled={!!isCartActionLoadingUuid || !!isNavigationLoadingTarget}
								onClick={(Parameter_event) => {
									Parameter_event.stopPropagation()
									if (!Let_contentSingle.raw_content) {
										return
									}

									Function_addContentToCartAndGo(Let_contentSingle.raw_content).catch(() => {
										setViewerError("Não foi possível adicionar esse conteúdo no carrinho agora.")
									})
								}}
							>
								Adicionar
							</Button>
						</>
					) : Const_canOpenFull ? (
						<Button
							size="md"
							variant="solid"
							className="min-h-11 px-4 text-base font-semibold bg-new-secondary text-white active:bg-new-secondary-700"
							startContent={<Eye size={18} />}
							isDisabled={Const_isLoadingThisContent}
							onClick={(Parameter_event) => {
								Parameter_event.stopPropagation()
								Function_handleOpenViewer()
							}}
						>
							Ver completo
						</Button>
					) : (
						<Button
							size="md"
							color="default"
							variant="solid"
							className="min-h-11 px-4 text-base font-semibold bg-default-300 text-default-800 active:bg-default-500"
							startContent={<Clock3 size={18} />}
							isDisabled
						>
							Disponivel em breve
						</Button>
					)}
				</div>
			</div>
		)
	}

	return (
		<>
			<div className="w-full max-w-[980px] mx-auto pb-10 pt-3">
				<div className="mb-[18px] flex flex-row gap-2 md:flex-row md:justify-end">
					<Button
						color={"new-primary" as unknown as "default"}
						variant="bordered"
						className="w-full max-w-[420px] md:w-auto font-semibold border-new-primary text-new-primary active:bg-new-primary active:text-white"
						startContent={<FilePlus2 size={18} />}
						isLoading={isNavigationLoadingTarget === "postar"}
						isDisabled={!!isNavigationLoadingTarget}
						onClick={() => Function_navigateWithFeedback("/postar", "postar")}
					>
						Postar
					</Button>
					<Button
						color={"new-secondary" as unknown as "default"}
						variant="bordered"
						className="w-full max-w-[420px] md:w-auto font-semibold border-new-secondary text-new-secondary active:bg-new-secondary active:text-white"
						startContent={<GraduationCap size={18} />}
						isDisabled={!!isNavigationLoadingTarget}
						onClick={() => Function_openSelectionModal("manual")}
					>
						Curso
					</Button>
					<Button
						color={"new-tertiary" as unknown as "default"}
						variant="bordered"
						className="w-full max-w-[420px] md:w-auto font-semibold border-new-tertiary text-new-tertiary active:bg-new-tertiary active:text-white"
						startContent={<ShoppingCart size={18} />}
						isLoading={isNavigationLoadingTarget === "carrinho"}
						isDisabled={!!isNavigationLoadingTarget}
						onClick={() => Function_navigateWithFeedback("/carrinho", "carrinho")}
					>
						Carrinho
					</Button>
				</div>

				<div className="mb-5 flex gap-x-3 gap-y-0 flex-wrap">
					<div className="flex items-center gap-2">
						<LibraryBig size={20} className="text-default-600" />
						<h1 className="text-2xl font-semibold">Biblioteca</h1>
					</div>
					<div className="text-sm text-default-600 space-y-0.5 mb-0.5 flex items-end">
						<div className="font-medium">
							{/* {isLibrarySummaryCollegeName} -  */}{isLibrarySummaryCourseName}
						</div>
						{/* <div>
							{isLibraryContentDisplayArray.length} conteúdos encontrados
						</div> */}
					</div>
				</div>

				{isViewerError ? (
					<div className="mb-4 rounded-xl border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700">
						{isViewerError}
					</div>
				) : null}

				<div className="space-y-7">
					<div className="px-1">
						<div className="relative flex items-center justify-center">
							<div className="h-px flex-1 bg-gradient-to-r from-transparent via-default-300 to-transparent" />
							<span className="mx-3 rounded-full border border-default-300 bg-default-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-default-600">
								Conteúdos em destaque
							</span>
							<div className="h-px flex-1 bg-gradient-to-r from-transparent via-default-300 to-transparent" />
						</div>
					</div>

					<section>
						{/* <div className="mb-3">
							<h2 className="inline-flex items-center gap-2 rounded-full bg-warning-100 px-3 py-1 text-base font-semibold text-warning-700">
								<span>Em destaque</span>
								<Trophy size={18} className="text-warning-700" />
							</h2>
						</div> */}
						{isLibraryGroupedContent.featured.length <= 0 ? (
							<div className="rounded-xl border border-default-200 bg-default-50 p-4 text-sm text-default-600">
								{"Sem conte\u00FAdo em destaque"}
							</div>
						) : (
							<div className="grid grid-cols-1 gap-5">
								{isLibraryGroupedContent.featured.map(Function_renderLibraryContentCard)}
							</div>
						)}
					</section>

					<div className="px-1">
						<div className="relative flex items-center justify-center">
							<div className="h-px flex-1 bg-gradient-to-r from-transparent via-default-300 to-transparent" />
							<span className="mx-3 rounded-full border border-default-300 bg-default-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-default-600">
								Conteúdos antigos
							</span>
							<div className="h-px flex-1 bg-gradient-to-r from-transparent via-default-300 to-transparent" />
						</div>
					</div>

					<section>
						{isLibraryGroupedContent.old.length <= 0 ? (
							<div className="rounded-xl border border-default-200 bg-default-50 p-4 text-sm text-default-600">
								{"Sem conte\u00FAdo antigo"}
							</div>
						) : (
							<>
								<div className="grid grid-cols-1 gap-5">
									{isLibraryOldVisibleContentArray.map(Function_renderLibraryContentCard)}
								</div>
								{isHasMoreOldContent ? (
									<div className="mt-4 flex justify-center">
										<Button
											variant="bordered"
											className="font-semibold border-default-400 text-default-800 active:bg-default-500 active:text-white"
											onClick={() => {
												setOldContentVisibleCount((Parameter_previous) => {
													const Const_next = Parameter_previous + Const_oldContentLoadMoreStep
													return Math.min(Const_next, isLibraryGroupedContent.old.length)
												})
											}}
										>
											Mostrar mais {Math.min(Const_oldContentLoadMoreStep, isLibraryGroupedContent.old.length - isOldContentVisibleCount)}
										</Button>
									</div>
								) : null}
							</>
						)}
					</section>
				</div>

				{/*
					<div className="mb-6 flex flex-col">
						<h1 className="text-2xl font-semibold">Biblioteca</h1>
						<span className="text-sm text-default-500">
							{isLibraryContentArray.length} conteúdos encontrados
						</span>
					</div>

					{isViewerError ? (
						<div className="mb-4 rounded-xl border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700">
							{isViewerError}
						</div>
					) : null}

					{isLibraryContentArray.length <= 0 ? (
						<div className="py-14 sm:py-16 flex flex-col items-center justify-center gap-3 text-center">
							<div className="h-12 w-12 rounded-full bg-default-100 text-default-500 flex items-center justify-center">
								<LibraryBig size={22} />
							</div>
							<p className="text-sm sm:text-base font-medium text-default-700">
								Nenhum conteúdo disponivel no momento
							</p>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{isLibraryContentArray.map((Let_contentSingle) => (
								<Card
									key={Let_contentSingle.content_uuid}
									isPressable
									onPress={() => {
										Function_openViewer(Let_contentSingle).catch(() => {
											setViewerError("Não foi possível abrir o conteúdo agora.")
										})
									}}
									className="border border-default-200"
								>
									<CardHeader className="flex flex-col items-start gap-1 pb-1">
										<div className="text-lg font-semibold">{Let_contentSingle.name_content}</div>
										<div className="text-xs text-default-500">
											Atualizado em {new Date(Let_contentSingle.content_update).toLocaleString("pt-BR")}
										</div>
									</CardHeader>
									<CardBody className="pt-1">
										<div className="flex items-center justify-between">
											<span className="text-sm text-default-600">Preço</span>
											<span className="text-lg font-bold text-success">
												R$ {Let_contentSingle.current_price_content.toFixed(2).replace(".", ",")}
											</span>
										</div>
									</CardBody>
									<CardFooter className="pt-0 flex items-center justify-between">
										<span className={`text-xs font-semibold ${Let_contentSingle.isAcquiredContent ? "text-success" : "text-warning-700"}`}>
											{Let_contentSingle.isAcquiredContent ? "Conteúdo adquirido" : "Previa disponivel"}
										</span>
										<Button
											size="sm"
											color={Let_contentSingle.isAcquiredContent ? "success" : "secondary"}
											variant="bordered"
											className={Let_contentSingle.isAcquiredContent
												? "active:bg-success-500 active:text-white"
												: "active:bg-secondary-500 active:text-white"}
											startContent={<Eye size={14} />}
										>
											Ver conteúdo
										</Button>
									</CardFooter>
								</Card>
							))}
						</div>
					)}
				*/}
			</div>

			<Modal
				isOpen={isSelectionModalOpen}
				hideCloseButton
				backdrop="blur"
				isDismissable={isSelectionModalMode === "manual"}
				isKeyboardDismissDisabled={isSelectionModalMode !== "manual"}
				onOpenChange={(Parameter_isOpen) => {
					if (!Parameter_isOpen) {
						Function_closeSelectionModal()
					}
				}}
				classNames={{
					base: "m-0 h-[100dvh] max-h-[100dvh] w-screen max-w-none rounded-none sm:m-4 sm:h-[min(92dvh,780px)] sm:max-h-[92dvh] sm:max-w-[920px] sm:rounded-2xl",
					header: "border-b border-default-200 px-4 sm:px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-4",
					body: "p-0 overflow-hidden",
					footer: "border-t border-default-200 px-4 sm:px-6 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]"
				}}
			>
				<ModalContent>
					<ModalHeader className="flex items-start">
						<span className="text-[19px] sm:text-[20px] font-semibold tracking-tight">
							{isSelectionModalStep === "college"
								? "Selecione sua faculdade, e clique em Continuar"
								: "Selecione seu curso, e clique em Finalizar"}
						</span>
					</ModalHeader>

					<ModalBody>
						<div className="h-full min-h-0 flex flex-col">
							{isSelectionModalError ? (
								<div className="mx-4 sm:mx-6 mt-3 rounded-lg border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700">
									{isSelectionModalError}
								</div>
							) : null}

							<div className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6 py-4">
								<div className="space-y-3">
									{isSelectionModalStep === "college" ? (
										isDisplayCollegeArray.length > 0 ? (
											isDisplayCollegeArray.map((Let_collegeSingle) => {
												const Const_isSelected = Let_collegeSingle.college_uuid === isSelectedCollegeUuid
												return (
													<button
														key={Let_collegeSingle.college_uuid}
														type="button"
														onClick={() => {
															setSelectedCollegeUuid(Let_collegeSingle.college_uuid)
															if (isSelectedCollegeUuid !== Let_collegeSingle.college_uuid) {
																setSelectedCourseUuid("")
															}
														}}
														className={`w-full text-left rounded-xl border px-4 py-3 transition-all duration-200 ${Const_isSelected
															? "border-primary bg-primary-50 shadow-[0_0_0_1px_hsl(var(--nextui-primary)/0.35)]"
															: "border-default-200 bg-white active:border-primary/60 active:bg-default-50"
															}`}
													>
														<div className="flex items-center justify-between gap-3">
															<div className="min-w-0 flex items-center gap-3">
																<div className="h-10 w-10 rounded-lg border border-default-200 bg-default-50 flex items-center justify-center overflow-hidden shrink-0">
																	{Function_renderInstitutionVisual(Let_collegeSingle.name_college, Let_collegeSingle.svg_college, "college")}
																</div>
																<div className="text-sm sm:text-base font-semibold text-default-800 truncate">
																	{Let_collegeSingle.name_college}
																</div>
															</div>
															<div className={`h-5 w-5 rounded-full border flex items-center justify-center ${Const_isSelected ? "bg-primary border-primary text-white" : "border-default-300 text-transparent"}`}>
																<Check size={14} />
															</div>
														</div>
													</button>
												)
											})
										) : (
											<div className="rounded-xl border border-default-200 p-4 text-sm text-default-500">
												Nenhuma faculdade encontrada.
											</div>
										)
									) : (
										isDisplayCourseArray.length > 0 ? (
											isDisplayCourseArray.map((Let_courseSingle) => {
												const Const_isSelected = Let_courseSingle.course_uuid === isSelectedCourseUuid
												return (
													<button
														key={Let_courseSingle.course_uuid}
														type="button"
														onClick={() => setSelectedCourseUuid(Let_courseSingle.course_uuid)}
														className={`w-full text-left rounded-xl border px-4 py-3 transition-all duration-200 ${Const_isSelected
															? "border-primary bg-primary-50 shadow-[0_0_0_1px_hsl(var(--nextui-primary)/0.35)]"
															: "border-default-200 bg-white active:border-primary/60 active:bg-default-50"
															}`}
													>
														<div className="flex items-center justify-between gap-3">
															<div className="min-w-0 flex items-center gap-3">
																<div className="h-10 w-10 rounded-lg border border-default-200 bg-default-50 flex items-center justify-center overflow-hidden shrink-0">
																	{Function_renderInstitutionVisual(Let_courseSingle.name_course, Let_courseSingle.svg_course, "course")}
																</div>
																<div className="text-sm sm:text-base font-semibold text-default-800 truncate">
																	{Let_courseSingle.name_course}
																</div>
															</div>
															<div className={`h-5 w-5 rounded-full border flex items-center justify-center ${Const_isSelected ? "bg-primary border-primary text-white" : "border-default-300 text-transparent"}`}>
																<Check size={14} />
															</div>
														</div>
													</button>
												)
											})
										) : (
											<div className="rounded-xl border border-default-200 p-4 text-sm text-default-500">
												Nenhum curso encontrado para essa faculdade.
											</div>
										)
									)}
								</div>
							</div>
						</div>
					</ModalBody>

					<ModalFooter>
						<div className="w-full flex items-center justify-between gap-2">
							{isSelectionModalStep === "college" ? (
								isSelectionModalMode === "manual" ? (
									<Button
										variant="bordered"
										color="default"
										className="min-w-[124px] font-semibold border-default-400 bg-default-100 text-default-900 active:bg-default-500 active:text-white"
										startContent={<ArrowLeft size={16} />}
										onClick={Function_closeSelectionModal}
									>
										Voltar
									</Button>
								) : (
									<div />
								)
							) : (
								<Button
									variant="bordered"
									color="default"
									className="min-w-[124px] font-semibold border-default-400 bg-default-100 text-default-900 active:bg-default-500 active:text-white"
									startContent={<ArrowLeft size={16} />}
									onClick={() => setSelectionModalStep("college")}
									isDisabled={isSelectionStepLoading}
								>
									Voltar
								</Button>
							)}

							{isSelectionModalStep === "college" ? (
								<Button
									color={isSelectedCollegeUuid ? "primary" : "default"}
									variant="solid"
									className={`min-w-[124px] font-semibold ${isSelectedCollegeUuid ? "active:bg-primary-700 active:text-white" : "active:bg-default-400 active:text-default-900"} ${!isSelectedCollegeUuid ? "bg-default-300 text-default-700" : ""}`}
									endContent={<ArrowRight size={16} />}
									onClick={() => {
										Function_handleContinueFromCollege().catch(() => {
											setSelectionModalError("Não foi possível continuar.")
										})
									}}
									isDisabled={!isSelectedCollegeUuid || isSelectionStepLoading}
									isLoading={isSelectionStepLoading}
								>
									Continuar
								</Button>
							) : (
								<Button
									color={isSelectedCourseUuid ? "primary" : "default"}
									variant="solid"
									className={`min-w-[124px] font-semibold ${isSelectedCourseUuid ? "active:bg-primary-700 active:text-white" : "active:bg-default-400 active:text-default-900"} ${!isSelectedCourseUuid ? "bg-default-300 text-default-700" : ""}`}
									endContent={<Check size={16} />}
									onClick={() => {
										Function_handleFinalizeSelection().catch(() => {
											setSelectionModalError("Não foi possível finalizar.")
										})
									}}
									isDisabled={!isSelectedCourseUuid || isSelectionStepLoading}
									isLoading={isSelectionStepLoading}
								>
									Finalizar
								</Button>
							)}
						</div>
					</ModalFooter>
				</ModalContent>
			</Modal>

			<Component_ContentViewerModalClient
				isOpen={isViewerModalOpen}
				onClose={Function_closeViewerModal}
				ownerAlias={Function_getStudentAlias(isViewerItem?.student_uuid_content || "")}
				isLoading={isViewerLoading}
				fileUrl={isViewerFileUrl}
				isHtmlFile={isViewerHtmlFile}
				iframeRef={isViewerIframeRef}
				onIframeLoad={Function_handleViewerIframeLoad}
				iframeHeightPx={isViewerIframeHeightPx}
				errorMessage={isViewerError}
				reportContentUuid={isViewerItem?.content_uuid || ""}
				topActions={isViewerItem?.isAcquiredContent ? (
					<Button
						onClick={Function_downloadViewerFile}
						isLoading={isViewerDownloadLoading}
						isDisabled={!isViewerFileUrl || isViewerLoading}
						variant="bordered"
						className="tracking-[0.5px] text-[16px] font-medium border-new-primary text-new-primary active:bg-new-primary active:text-white"
					>
						Baixar arquivo
					</Button>
				) : null}
				floatingAction={isViewerItem && !isViewerItem.isAcquiredContent && !isViewerLoading ? (
					<Button
						onClick={() => {
							Function_addContentToCartAndGo(isViewerItem).catch(() => {
								setViewerError("Não foi possível adicionar esse conteúdo no carrinho agora.")
							})
						}}
						isLoading={isCartActionLoadingUuid === isViewerItem.content_uuid}
						isDisabled={!!isCartActionLoadingUuid || !!isNavigationLoadingTarget}
						variant="solid"
						className="animate-bounce gap-0 fixed inset-x-0 mx-auto top-[80vh] z-50 w-[min(92vw,320px)] h-[82px] flex flex-col justify-center text-lg text-white font-bold bg-new-secondary-450 active:bg-new-secondary-600 !opacity-100"
					>
						<span className="order-1 tracking-[1px]">
							VER COMPLETO AGORA!
						</span>
						<div className="order-3 flex flex-row flex-nowrap items-baseline justify-center w-full gap-3">
							{typeof isViewerItem.old_price_content === "number" &&
							isViewerItem.old_price_content > 0 &&
							isViewerItem.old_price_content !== isViewerItem.current_price_content ? (
								<span className="text-danger mb-0.5 items-end font-medium text-base line-through">
									{Function_formatCurrencyBRL(isViewerItem.old_price_content)}
								</span>
							) : null}
							<div className="flex flex-row flex-nowrap items-baseline">
								<span className="text-white text-[22px]">
									{Function_formatCurrencyBRL(isViewerItem.current_price_content)}
								</span>
							</div>
						</div>
					</Button>
				) : null}
			/>
		</>
	)
}
