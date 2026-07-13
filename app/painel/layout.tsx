'use client'

import { Component_HeaderIdChatbotContentServer } from "@/component/(path_[id-chatbot])/layout_[id-chatbot]/ui/header_[id-chatbot]/header_[id-chatbot]_content_server"
import { Const_paymentPaidEventName } from "@/app/payment_status_watcher_client"
import { Type_backendStudentBibliotecaResponse, Type_backendStudentSessaoResponse } from "@/env"
import { Card, CardBody } from "@nextui-org/react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { PageContext, Type_panelSession } from "./layout_context"

const Const_studentSessionStorageKey = 'somente_alunos_student_session_v1'
const Const_libraryStorageKeyPrefix = "somente_alunos_library_v1"

function Function_getSessionFromStorage(): Type_panelSession | null {
	if (typeof localStorage === 'undefined') {
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

function Function_saveSessionOnStorage(Parameter_session: Type_panelSession): void {
	if (typeof localStorage === "undefined") {
		return
	}

	localStorage.setItem(Const_studentSessionStorageKey, JSON.stringify(Parameter_session))
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

function Function_getLibrarySignature(Parameter_contentArray: Type_backendStudentBibliotecaResponse["contentArray"]): string {
	return JSON.stringify(
		Parameter_contentArray.map((Parameter_single) => ([
			Parameter_single.content_uuid,
			Parameter_single.content_update,
			Parameter_single.name_content,
			Parameter_single.student_uuid_content,
			Parameter_single.old_price_content ?? null,
			Parameter_single.current_price_content,
			Parameter_single.preview_file_uuid_content ?? null,
			Parameter_single.full_file_uuid_content ?? null,
			Parameter_single.prevision_content ?? null,
			Parameter_single.verified_content,
			Parameter_single.isAcquiredContent
		]))
	)
}

function Function_getLibraryFromStorage(
	Parameter_storageKey: string
): { contentArray: Type_backendStudentBibliotecaResponse["contentArray"]; buyer: boolean } | null {
	if (typeof localStorage === "undefined" || !Parameter_storageKey) {
		return null
	}

	try {
		const Const_storageValue = localStorage.getItem(Parameter_storageKey)
		if (!Const_storageValue) {
			return null
		}

		const Const_storageUnknown = JSON.parse(Const_storageValue) as { contentArray?: unknown; buyer?: unknown }
		if (!Array.isArray(Const_storageUnknown?.contentArray)) {
			return null
		}

		return {
			contentArray: Const_storageUnknown.contentArray as Type_backendStudentBibliotecaResponse["contentArray"],
			buyer: Const_storageUnknown.buyer === true
		}
	}
	catch {
		return null
	}
}

function Function_saveLibraryOnStorage(
	Parameter_storageKey: string,
	Parameter_contentArray: Type_backendStudentBibliotecaResponse["contentArray"],
	Parameter_buyer: boolean
): void {
	if (typeof localStorage === "undefined" || !Parameter_storageKey) {
		return
	}

	localStorage.setItem(Parameter_storageKey, JSON.stringify({
		contentArray: Parameter_contentArray,
		buyer: Parameter_buyer
	}))
}

export default function Layout_Painel(Parameter_content: Readonly<{ children: React.ReactNode }>): JSX.Element {
	const Const_children = Parameter_content.children
	const Const_router = useRouter()

	const [isSession, setSession] = useState<Type_panelSession | null>(null)
	const [isLibraryContentArray, setLibraryContentArray] = useState<Type_backendStudentBibliotecaResponse['contentArray']>([])
	const [isLibraryBuyer, setLibraryBuyer] = useState(false)
	const [isStudentUuidHeader, setStudentUuidHeader] = useState('')
	const isLibrarySignatureRef = useRef(Function_getLibrarySignature([]))
	const isLibraryBuyerRef = useRef(false)
	const isSessionRevalidatedRef = useRef(false)

	const Function_getRedirectToLoginUrl = useCallback((): string => {
		if (typeof window === 'undefined') {
			return '/entrar'
		}

		const Const_searchParams = new URLSearchParams(window.location.search)
		return Const_searchParams.has('redirect') ? '/entrar?redirect=1' : '/entrar'
	}, [])

	const Function_redirectToLogin = useCallback(() => {
		Const_router.push(Function_getRedirectToLoginUrl())
	}, [Const_router, Function_getRedirectToLoginUrl])

	const Function_refreshLibrary = useCallback(async (): Promise<Type_backendStudentBibliotecaResponse['contentArray']> => {
		const Const_collegeUuid = isSession?.student?.college_uuid_student || ""
		const Const_courseUuid = isSession?.student?.course_uuid_student || ""
		const Const_storageKey = Function_getLibraryStorageKey(isSession)
		if (!Const_storageKey || !Const_collegeUuid || !Const_courseUuid) {
			const Const_emptySignature = Function_getLibrarySignature([])
			if (isLibrarySignatureRef.current !== Const_emptySignature) {
				isLibrarySignatureRef.current = Const_emptySignature
				setLibraryContentArray([])
			}
			return []
		}

		const Const_url = new URL(`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/get/student/biblioteca`)
		Const_url.searchParams.set('college_uuid_content', Const_collegeUuid)
		Const_url.searchParams.set('course_uuid_content', Const_courseUuid)

		const Const_response = await fetch(Const_url.toString(), { credentials: 'include' })
		if (!Const_response.ok) {
			if (Const_response.status === 451) {
				Function_redirectToLogin()
				return []
			}

			throw new Error('Falha ao buscar biblioteca')
		}

		const Const_responseBody = await Const_response.json() as Type_backendStudentBibliotecaResponse
		const Const_contentArray = Array.isArray(Const_responseBody.contentArray) ? Const_responseBody.contentArray : []
		const Const_buyer = Const_responseBody.buyer === true
		const Const_nextSignature = Function_getLibrarySignature(Const_contentArray)

		const Const_isContentChanged = isLibrarySignatureRef.current !== Const_nextSignature
		const Const_isBuyerChanged = isLibraryBuyerRef.current !== Const_buyer

		if (Const_isContentChanged) {
			isLibrarySignatureRef.current = Const_nextSignature
			setLibraryContentArray(Const_contentArray)
		}
		if (Const_isBuyerChanged) {
			isLibraryBuyerRef.current = Const_buyer
			setLibraryBuyer(Const_buyer)
		}

		// localStorage.setItem e sincrono e escreve em disco: rodar isso a cada poll
		// (1.5s) trava a main thread e faz a barra, o percentual e ate as animacoes de
		// CSS engasgarem. So grava quando algo realmente mudou.
		if (Const_isContentChanged || Const_isBuyerChanged) {
			Function_saveLibraryOnStorage(Const_storageKey, Const_contentArray, Const_buyer)
		}

		return Const_contentArray
	}, [isSession, Function_redirectToLogin])

	useEffect(() => {
		const Const_session = Function_getSessionFromStorage()
		if (!Const_session) {
			Function_redirectToLogin()
			return
		}

		setStudentUuidHeader(Const_session.student.student_uuid || '')
		setSession(Const_session)
	}, [Function_redirectToLogin])

	// A sessao do aluno so era escrita no login e vivia no localStorage para sempre. Quando o suporte
	// corrigia a faculdade-e-curso no D1, o dispositivo do aluno continuava com o valor antigo mesmo
	// depois de recarregar a pagina. Aqui, uma vez por carregamento, o D1 volta a ser a fonte da verdade.
	useEffect(() => {
		if (!isSession || isSessionRevalidatedRef.current) {
			return
		}
		isSessionRevalidatedRef.current = true

		const Const_studentBeforeRevalidate = isSession.student
		let Const_isMounted = true

		const Function_revalidateSession = async (): Promise<void> => {
			try {
				const Const_response = await fetch(`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/get/student/sessao`, {
					credentials: 'include',
					cache: 'no-store'
				})
				if (!Const_response.ok) {
					if (Const_response.status === 451) {
						Function_redirectToLogin()
					}
					return
				}

				const Const_responseBody = await Const_response.json() as Type_backendStudentSessaoResponse
				const Const_studentFromD1 = Const_responseBody?.student
				if (!Const_isMounted || !Const_studentFromD1?.student_uuid) {
					return
				}

				setSession((Parameter_previousSession) => {
					if (!Parameter_previousSession) {
						return Parameter_previousSession
					}

					const Const_previousStudent = Parameter_previousSession.student
					if (Const_previousStudent.student_uuid !== Const_studentFromD1.student_uuid) {
						return Parameter_previousSession
					}

					// Se o proprio aluno confirmou faculdade-e-curso enquanto esta revalidacao estava no ar,
					// a escolha dele e mais nova que a resposta em maos: nao sobrescreve.
					const Const_isSessionUntouched = (
						Const_previousStudent.college_uuid_student === Const_studentBeforeRevalidate.college_uuid_student &&
						Const_previousStudent.course_uuid_student === Const_studentBeforeRevalidate.course_uuid_student &&
						Const_previousStudent.is_suggested_information_student === Const_studentBeforeRevalidate.is_suggested_information_student
					)
					if (!Const_isSessionUntouched) {
						return Parameter_previousSession
					}

					const Const_isSameStudent = (
						Const_previousStudent.college_uuid_student === Const_studentFromD1.college_uuid_student &&
						Const_previousStudent.course_uuid_student === Const_studentFromD1.course_uuid_student &&
						Const_previousStudent.is_suggested_information_student === Const_studentFromD1.is_suggested_information_student
					)
					if (Const_isSameStudent) {
						return Parameter_previousSession
					}

					const Const_nextSession: Type_panelSession = {
						...Parameter_previousSession,
						student: {
							...Const_previousStudent,
							college_uuid_student: Const_studentFromD1.college_uuid_student,
							course_uuid_student: Const_studentFromD1.course_uuid_student,
							is_suggested_information_student: Const_studentFromD1.is_suggested_information_student
						}
					}
					Function_saveSessionOnStorage(Const_nextSession)
					return Const_nextSession
				})
			}
			catch {
				// Revalidacao silenciosa: falha de rede mantem a sessao que ja esta em cache.
			}
		}

		Function_revalidateSession()

		return () => {
			Const_isMounted = false
		}
	}, [isSession, Function_redirectToLogin])

	useEffect(() => {
		if (!isSession) {
			return
		}

		const Const_storageKey = Function_getLibraryStorageKey(isSession)
		const Const_cached = Function_getLibraryFromStorage(Const_storageKey)
		if (Const_cached) {
			const Const_cachedSignature = Function_getLibrarySignature(Const_cached.contentArray)
			if (isLibrarySignatureRef.current !== Const_cachedSignature) {
				isLibrarySignatureRef.current = Const_cachedSignature
				setLibraryContentArray(Const_cached.contentArray)
			}
			isLibraryBuyerRef.current = Const_cached.buyer
			setLibraryBuyer(Const_cached.buyer)
		}
		else {
			const Const_emptySignature = Function_getLibrarySignature([])
			if (isLibrarySignatureRef.current !== Const_emptySignature) {
				isLibrarySignatureRef.current = Const_emptySignature
				setLibraryContentArray([])
			}
		}

		Function_refreshLibrary().catch(() => undefined)
	}, [isSession, Function_refreshLibrary])

	useEffect(() => {
		const Function_refreshAfterPayment = () => {
			Function_refreshLibrary().catch(() => undefined)
		}

		window.addEventListener(Const_paymentPaidEventName, Function_refreshAfterPayment)

		return () => {
			window.removeEventListener(Const_paymentPaidEventName, Function_refreshAfterPayment)
		}
	}, [Function_refreshLibrary])

	return (
		<>
			<header>
				<Component_HeaderIdChatbotContentServer value={{ isInfUser: { user_uuid: isStudentUuidHeader } }} />
			</header>

			<main className="flex justify-center pt-[15px] px-[8px] mt-[74px]">
				<Card className="flex w-[1200px] px-3 pt-2 md:pt-0 pb-3 p-0 border-small border-default-200 shadow-none border-none">
					<CardBody id='IdElement_cardBodyIdChatbot' className='pt-0 overflow-hidden !px-[0px] md:!px-[40px]'>
						<PageContext.Provider value={{
							session: isSession,
							setSession,
							libraryContentArray: isLibraryContentArray,
							setLibraryContentArray,
							libraryBuyer: isLibraryBuyer,
							refreshLibrary: Function_refreshLibrary
						}}>
							{Const_children}
						</PageContext.Provider>
					</CardBody>
				</Card>
			</main>
		</>
	)
}
