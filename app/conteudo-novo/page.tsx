"use client"

export const runtime = "edge"

import { Type_panelSession } from "@/app/painel/layout_context"
import {
	Type_backendCollege,
	Type_backendContent,
	Type_backendCourse,
	Type_backendStudentConteudoFileResponse,
	Type_backendStudentConteudoResponse,
	Type_backendStudentPostadoResponse
} from "@/env"
import { Component_HeaderIdChatbotContentServer } from "@/component/(path_[id-chatbot])/layout_[id-chatbot]/ui/header_[id-chatbot]/header_[id-chatbot]_content_server"
import { Button, Card, CardBody, Spinner } from "@nextui-org/react"
import { ArrowLeft, Check, FileText, Save } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"

const Const_studentSessionStorageKey = "somente_alunos_student_session_v1"
const Const_maxUploadSizeInBytes = 5 * 1024 * 1024

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

function Function_getTrimmedString(Parameter_value: string): string {
	return Parameter_value.trim()
}

function Function_isValidUploadFile(Parameter_file: File): boolean {
	if (Parameter_file.size > Const_maxUploadSizeInBytes) {
		return false
	}

	const Const_type = (Parameter_file.type || "").toLowerCase()
	if (Const_type === "application/pdf" || Const_type === "text/html") {
		return true
	}

	const Const_name = Parameter_file.name.toLowerCase()
	return Const_name.endsWith(".pdf") || Const_name.endsWith(".html")
}

export default function Page_ConteudoNovo(): JSX.Element {
	const Const_router = useRouter()
	const Const_searchParams = useSearchParams()

	const [isSession, setSession] = useState<Type_panelSession | null>(null)
	const [isPageLoading, setPageLoading] = useState(true)
	const [isBootstrapLoading, setBootstrapLoading] = useState(false)
	const [isSubmitLoading, setSubmitLoading] = useState(false)
	const [isPageError, setPageError] = useState("")
	const [isPageSuccess, setPageSuccess] = useState("")
	const [isNavigationLoadingTarget, setNavigationLoadingTarget] = useState("")

	const [isCollegeArray, setCollegeArray] = useState<Type_backendCollege[]>([])
	const [isCourseArray, setCourseArray] = useState<Type_backendCourse[]>([])
	const [isCurrentContent, setCurrentContent] = useState<Type_backendContent | null>(null)

	const [isNameContent, setNameContent] = useState("")
	const [isCurrentPriceContent, setCurrentPriceContent] = useState("")
	const [isCollegeUuidContent, setCollegeUuidContent] = useState("")
	const [isCourseUuidContent, setCourseUuidContent] = useState("")
	const [isPrevisionContent, setPrevisionContent] = useState("")
	const [isPreviewFile, setPreviewFile] = useState<File | null>(null)
	const [isFullFile, setFullFile] = useState<File | null>(null)

	const isEditingContentUuid = useMemo(() => {
		const Const_value = Const_searchParams.get("content_uuid") || ""
		return Const_value.trim()
	}, [Const_searchParams])
	const isEditingMode = isEditingContentUuid.length > 0

	const Function_fetchCollegeArray = useCallback(async (): Promise<Type_backendCollege[]> => {
		const Const_response = await fetch(`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/get/student-or-admin/faculdade/todas`, {
			credentials: "include"
		})
		if (!Const_response.ok) {
			if (Const_response.status === 451) {
				Const_router.push("/entrar")
			}
			throw new Error("Falha ao buscar faculdades")
		}

		const Const_responseBody = await Const_response.json() as { collegeArray?: Type_backendCollege[] }
		return Array.isArray(Const_responseBody.collegeArray) ? Const_responseBody.collegeArray : []
	}, [Const_router])

	const Function_fetchCourseArray = useCallback(async (Parameter_collegeUuid: string): Promise<Type_backendCourse[]> => {
		if (!Parameter_collegeUuid) {
			return []
		}

		const Const_response = await fetch(
			`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/get/student-or-admin/curso/especifico?college_uuid_course=${encodeURIComponent(Parameter_collegeUuid)}`,
			{ credentials: "include" }
		)
		if (!Const_response.ok) {
			if (Const_response.status === 451) {
				Const_router.push("/entrar")
			}
			throw new Error("Falha ao buscar cursos")
		}

		const Const_responseBody = await Const_response.json() as { courseArray?: Type_backendCourse[] }
		return Array.isArray(Const_responseBody.courseArray) ? Const_responseBody.courseArray : []
	}, [Const_router])

	const Function_fetchPostedContentArray = useCallback(async (): Promise<Type_backendContent[]> => {
		const Const_response = await fetch(`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/get/student/postado`, {
			credentials: "include"
		})
		if (!Const_response.ok) {
			if (Const_response.status === 451) {
				Const_router.push("/entrar")
			}
			throw new Error("Falha ao buscar conteúdos postados")
		}

		const Const_responseBody = await Const_response.json() as Type_backendStudentPostadoResponse
		return Array.isArray(Const_responseBody.contentArray) ? Const_responseBody.contentArray : []
	}, [Const_router])

	const Function_loadCourseArrayFromCollege = useCallback(async (
		Parameter_collegeUuid: string,
		Parameter_preferredCourseUuid?: string
	): Promise<void> => {
		if (!Parameter_collegeUuid) {
			setCourseArray([])
			setCourseUuidContent("")
			return
		}

		const Const_courseArray = await Function_fetchCourseArray(Parameter_collegeUuid)
		setCourseArray(Const_courseArray)

		if (Parameter_preferredCourseUuid && Const_courseArray.some((Parameter_single) => Parameter_single.course_uuid === Parameter_preferredCourseUuid)) {
			setCourseUuidContent(Parameter_preferredCourseUuid)
			return
		}

		setCourseUuidContent(Const_courseArray[0]?.course_uuid || "")
	}, [Function_fetchCourseArray])

	const Function_handleCollegeChange = useCallback(async (Parameter_collegeUuid: string): Promise<void> => {
		setCollegeUuidContent(Parameter_collegeUuid)
		setCourseUuidContent("")
		try {
			await Function_loadCourseArrayFromCollege(Parameter_collegeUuid)
		}
		catch {
			setPageError("Não foi possível carregar os cursos da faculdade selecionada.")
		}
	}, [Function_loadCourseArrayFromCollege])

	const Function_navigateToPostarWithFeedback = useCallback(() => {
		if (isNavigationLoadingTarget || isSubmitLoading) {
			return
		}

		setNavigationLoadingTarget("postar")
		Const_router.push("/postar")
	}, [Const_router, isNavigationLoadingTarget, isSubmitLoading])

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

		let Const_isMounted = true
		const Function_initialize = async () => {
			try {
				setBootstrapLoading(true)
				setPageError("")

				const Const_collegeArray = await Function_fetchCollegeArray()
				if (!Const_isMounted) {
					return
				}

				setCollegeArray(Const_collegeArray)
				if (isEditingMode) {
					const Const_postedContentArray = await Function_fetchPostedContentArray()
					if (!Const_isMounted) {
						return
					}

					const Const_contentFound = Const_postedContentArray.find(
						(Parameter_single) => Parameter_single.content_uuid === isEditingContentUuid
					)
					if (!Const_contentFound) {
						setPageError("Não encontramos esse conteúdo para editar.")
						return
					}

					setCurrentContent(Const_contentFound)
					setNameContent(Const_contentFound.name_content)
					setCurrentPriceContent(String(Const_contentFound.current_price_content))
					setCollegeUuidContent(Const_contentFound.college_uuid_content)
					setPrevisionContent(Const_contentFound.prevision_content ? Const_contentFound.prevision_content.slice(0, 10) : "")
					await Function_loadCourseArrayFromCollege(
						Const_contentFound.college_uuid_content,
						Const_contentFound.course_uuid_content
					)
					return
				}

				const Const_collegeUuidInitial = (
					isSession.student.college_uuid_student &&
					Const_collegeArray.some((Parameter_single) => Parameter_single.college_uuid === isSession.student.college_uuid_student)
				)
					? isSession.student.college_uuid_student
					: (Const_collegeArray[0]?.college_uuid || "")

				setCollegeUuidContent(Const_collegeUuidInitial)
				if (Const_collegeUuidInitial) {
					await Function_loadCourseArrayFromCollege(
						Const_collegeUuidInitial,
						isSession.student.course_uuid_student || undefined
					)
				}
			}
			catch {
				if (Const_isMounted) {
					setPageError("Não foi possível carregar os dados para postagem agora.")
				}
			}
			finally {
				if (Const_isMounted) {
					setBootstrapLoading(false)
				}
			}
		}

		Function_initialize().catch(() => undefined)
		return () => {
			Const_isMounted = false
		}
	}, [
		isSession,
		isEditingMode,
		isEditingContentUuid,
		Function_fetchCollegeArray,
		Function_fetchPostedContentArray,
		Function_loadCourseArrayFromCollege
	])

	const Function_handleSubmitContent = useCallback(async (Parameter_event: FormEvent<HTMLFormElement>): Promise<void> => {
		Parameter_event.preventDefault()

		const Const_nameContent = Function_getTrimmedString(isNameContent)
		const Const_collegeUuidContent = Function_getTrimmedString(isCollegeUuidContent)
		const Const_courseUuidContent = Function_getTrimmedString(isCourseUuidContent)
		const Const_previsionContent = Function_getTrimmedString(isPrevisionContent)
		const Const_priceNormalized = isCurrentPriceContent.replace(",", ".").trim()
		const Const_currentPriceContent = Number(Const_priceNormalized)

		if (!Const_nameContent || !Const_collegeUuidContent || !Const_courseUuidContent || !(Const_currentPriceContent > 0)) {
			setPageError("Preencha nome, preço, faculdade e curso corretamente.")
			return
		}

		setPageError("")
		setPageSuccess("")
		try {
			setSubmitLoading(true)
			let Let_contentUuid = isEditingContentUuid

			if (isEditingMode) {
				const Const_bodyPatch: {
					content_uuid: string;
					name_content: string;
					current_price_content: number;
					college_uuid_content: string;
					course_uuid_content: string;
					prevision_content?: string;
				} = {
					content_uuid: isEditingContentUuid,
					name_content: Const_nameContent,
					current_price_content: Number(Const_currentPriceContent.toFixed(2)),
					college_uuid_content: Const_collegeUuidContent,
					course_uuid_content: Const_courseUuidContent
				}

				if (Const_previsionContent) {
					Const_bodyPatch.prevision_content = Const_previsionContent
				}

				const Const_responsePatch = await fetch(`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/patch/student/conteudo`, {
					method: "PATCH",
					headers: { "content-type": "application/json; charset=utf-8" },
					credentials: "include",
					body: JSON.stringify(Const_bodyPatch)
				})
				if (!Const_responsePatch.ok) {
					if (Const_responsePatch.status === 451) {
						Const_router.push("/entrar")
						return
					}
					throw new Error("Falha ao atualizar conteúdo")
				}
			}
			else {
				const Const_formData = new FormData()
				Const_formData.append("name_content", Const_nameContent)
				Const_formData.append("current_price_content", String(Number(Const_currentPriceContent.toFixed(2))))
				Const_formData.append("college_uuid_content", Const_collegeUuidContent)
				Const_formData.append("course_uuid_content", Const_courseUuidContent)
				if (Const_previsionContent) {
					Const_formData.append("prevision_content", Const_previsionContent)
				}
				if (isPreviewFile) {
					Const_formData.append("preview_file_content", isPreviewFile)
				}
				if (isFullFile) {
					Const_formData.append("full_file_content", isFullFile)
				}

				const Const_responseCreate = await fetch(`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/post/student/conteudo`, {
					method: "POST",
					credentials: "include",
					body: Const_formData
				})
				if (!Const_responseCreate.ok) {
					if (Const_responseCreate.status === 451) {
						Const_router.push("/entrar")
						return
					}
					throw new Error("Falha ao criar conteúdo")
				}

				const Const_responseBodyCreate = await Const_responseCreate.json() as Type_backendStudentConteudoResponse
				Let_contentUuid = Const_responseBodyCreate?.content?.content_uuid || ""
				if (!Let_contentUuid) {
					throw new Error("Conteúdo criado sem UUID de retorno")
				}
			}

			if (isEditingMode && Let_contentUuid && (isPreviewFile || isFullFile)) {
				const Function_uploadSingleFile = async (Parameter_fileRole: "preview" | "full", Parameter_file: File): Promise<void> => {
					const Const_formDataFile = new FormData()
					Const_formDataFile.append("content_uuid", Let_contentUuid)
					Const_formDataFile.append("file_role", Parameter_fileRole)
					Const_formDataFile.append("file", Parameter_file)

					const Const_responseFile = await fetch(`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/post/student/conteudo/file`, {
						method: "POST",
						credentials: "include",
						body: Const_formDataFile
					})
					if (!Const_responseFile.ok) {
						if (Const_responseFile.status === 451) {
							Const_router.push("/entrar")
							return
						}
						throw new Error("Falha ao enviar arquivo de conteúdo")
					}

					await Const_responseFile.json() as Type_backendStudentConteudoFileResponse
				}

				if (isPreviewFile) {
					await Function_uploadSingleFile("preview", isPreviewFile)
				}
				if (isFullFile) {
					await Function_uploadSingleFile("full", isFullFile)
				}
			}

			setPageSuccess(isEditingMode ? "Conteúdo atualizado com sucesso." : "Conteúdo publicado com sucesso.")
			setTimeout(() => {
				Const_router.push("/postar")
			}, 400)
		}
		catch {
			setPageError("Não foi possível salvar esse conteúdo agora.")
		}
		finally {
			setSubmitLoading(false)
		}
	}, [
		Const_router,
		isEditingMode,
		isEditingContentUuid,
		isNameContent,
		isCurrentPriceContent,
		isCollegeUuidContent,
		isCourseUuidContent,
		isPrevisionContent,
		isPreviewFile,
		isFullFile
	])

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

			<main className="flex justify-center pt-[15px] px-[8px] mt-[74px]">
				<Card className="flex w-[1200px] px-3 pt-2 md:pt-0 pb-3 p-0 border-small border-default-200 shadow-none border-none">
					<CardBody className="pt-0 overflow-hidden !px-[0px] md:!px-[40px]">
						<div className="w-full max-w-[980px] mx-auto pb-10 pt-3">
							<div className="mb-5 flex items-center justify-center md:justify-end">
								<Button
									color="default"
									variant="bordered"
									className="w-full max-w-[420px] md:w-auto font-semibold border-default-400 bg-default-100 text-default-900 active:bg-default-500 active:text-white"
									startContent={<ArrowLeft size={18} />}
									isLoading={isNavigationLoadingTarget === "postar"}
									isDisabled={isSubmitLoading || !!isNavigationLoadingTarget}
									onClick={Function_navigateToPostarWithFeedback}
								>
									Voltar para Minhas Postagens
								</Button>
							</div>

							<section className="rounded-2xl border border-default-200 bg-white p-4 sm:p-6">
								<div className="mb-6 flex flex-col">
									<h1 className="text-2xl font-semibold">
										{isEditingMode ? "Editar conteúdo" : "Postar novo conteúdo"}
									</h1>
									<span className="text-sm text-default-500">
										{isEditingMode
											? "Atualize os campos abaixo e salve suas alteracoes."
											: "Preencha os campos para publicar um novo conteúdo."}
									</span>
								</div>
								<div className="mb-4 rounded-xl border border-warning-200 bg-warning-50 p-3 text-sm text-warning-800">
									Após enviar o conteúdo, aguarde ate 24 horas para ele ser aprovado ou rejeitado por um administrador.
								</div>
								<div className="mb-4 rounded-xl border border-default-300 bg-default-50 p-3 text-sm text-default-700">
									É aplicada uma taxa de 12% por transação para manutenção da plataforma, e o valor fica disponível após 7 dias por segurança contra possíveis reembolsos.
								</div>

								{isPageError ? (
									<div className="mb-4 rounded-xl border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700">
										{isPageError}
									</div>
								) : null}

								{isPageSuccess ? (
									<div className="mb-4 rounded-xl border border-success-200 bg-success-50 p-3 text-sm text-success-700">
										{isPageSuccess}
									</div>
								) : null}

								{isBootstrapLoading ? (
									<div className="py-14 sm:py-16 flex items-center justify-center">
										<Spinner />
									</div>
								) : (isEditingMode && !isCurrentContent) ? (
									<div className="py-14 sm:py-16 flex flex-col items-center gap-3 text-center">
										<p className="text-sm sm:text-base font-medium text-default-700">
											Não foi possível carregar esse conteúdo para edição.
										</p>
										<Button
											color="default"
											variant="bordered"
											className="font-semibold border-default-400 bg-default-100 text-default-900 active:bg-default-500 active:text-white"
											isLoading={isNavigationLoadingTarget === "postar"}
											isDisabled={isSubmitLoading || !!isNavigationLoadingTarget}
											onClick={Function_navigateToPostarWithFeedback}
										>
											Voltar para Minhas Postagens
										</Button>
									</div>
								) : (
									<form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(Parameter_event) => {
										Function_handleSubmitContent(Parameter_event).catch(() => undefined)
									}}>
										<label className="flex flex-col gap-1 md:col-span-2">
											<span className="text-sm font-medium text-default-700">Nome do conteúdo</span>
											<input
												className="w-full rounded-xl border border-default-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
												value={isNameContent}
												onChange={(Parameter_event) => setNameContent(Parameter_event.target.value)}
												placeholder="Ex: Lista de exercicios - Calculo I"
												required
											/>
										</label>

										<label className="flex flex-col gap-1">
											<span className="text-sm font-medium text-default-700">Preço (R$)</span>
											<input
												className="w-full rounded-xl border border-default-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
												value={isCurrentPriceContent}
												onChange={(Parameter_event) => setCurrentPriceContent(Parameter_event.target.value)}
												placeholder="0,00"
												inputMode="decimal"
												required
											/>
										</label>

										<label className="flex flex-col gap-1">
											<span className="text-sm font-medium text-default-700">Previsão (opcional)</span>
											<input
												className="w-full rounded-xl border border-default-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
												type="date"
												value={isPrevisionContent}
												onChange={(Parameter_event) => setPrevisionContent(Parameter_event.target.value)}
											/>
										</label>

										<label className="flex flex-col gap-1">
											<span className="text-sm font-medium text-default-700">Faculdade</span>
											<select
												className="w-full rounded-xl border border-default-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
												value={isCollegeUuidContent}
												onChange={(Parameter_event) => {
													Function_handleCollegeChange(Parameter_event.target.value).catch(() => undefined)
												}}
												required
											>
												<option value="" disabled>Selecione a faculdade</option>
												{isCollegeArray.map((Parameter_collegeSingle) => (
													<option key={Parameter_collegeSingle.college_uuid} value={Parameter_collegeSingle.college_uuid}>
														{Parameter_collegeSingle.name_college}
													</option>
												))}
											</select>
										</label>

										<label className="flex flex-col gap-1">
											<span className="text-sm font-medium text-default-700">Curso</span>
											<select
												className="w-full rounded-xl border border-default-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
												value={isCourseUuidContent}
												onChange={(Parameter_event) => setCourseUuidContent(Parameter_event.target.value)}
												required
											>
												<option value="" disabled>Selecione o curso</option>
												{isCourseArray.map((Parameter_courseSingle) => (
													<option key={Parameter_courseSingle.course_uuid} value={Parameter_courseSingle.course_uuid}>
														{Parameter_courseSingle.name_course}
													</option>
												))}
											</select>
										</label>

										<label className="flex flex-col gap-1 md:col-span-2">
											<span className="text-sm font-medium text-default-700">Arquivo de preview (PDF ou HTML)</span>
											<input
												className="w-full rounded-xl border border-default-300 px-3 py-2 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-white"
												type="file"
												accept=".pdf,.html,application/pdf,text/html"
												onChange={(Parameter_event) => {
													const Const_file = Parameter_event.target.files?.[0] || null
													if (Const_file && !Function_isValidUploadFile(Const_file)) {
														setPageError("Arquivo de preview invalido. Use PDF/HTML ate 5MB.")
														setPreviewFile(null)
														Parameter_event.currentTarget.value = ""
														return
													}
													setPageError("")
													setPreviewFile(Const_file)
												}}
											/>
											<span className="text-xs text-default-500">
												{isPreviewFile
													? `Novo arquivo: ${isPreviewFile.name}`
													: isCurrentContent?.preview_file_uuid_content
														? "Arquivo atual: prévia ja enviado"
														: "Arquivo atual: sem prévia"}
											</span>
										</label>

										<label className="flex flex-col gap-1 md:col-span-2">
											<span className="text-sm font-medium text-default-700">Arquivo completo (PDF ou HTML)</span>
											<input
												className="w-full rounded-xl border border-default-300 px-3 py-2 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-white"
												type="file"
												accept=".pdf,.html,application/pdf,text/html"
												onChange={(Parameter_event) => {
													const Const_file = Parameter_event.target.files?.[0] || null
													if (Const_file && !Function_isValidUploadFile(Const_file)) {
														setPageError("Arquivo completo invalido. Use PDF/HTML ate 5MB.")
														setFullFile(null)
														Parameter_event.currentTarget.value = ""
														return
													}
													setPageError("")
													setFullFile(Const_file)
												}}
											/>
											<span className="text-xs text-default-500">
												{isFullFile
													? `Novo arquivo: ${isFullFile.name}`
													: isCurrentContent?.full_file_uuid_content
														? "Arquivo atual: completo ja enviado"
														: "Arquivo atual: sem completo"}
											</span>
										</label>

										<div className="md:col-span-2 flex items-center justify-between pt-2 gap-3">
											<div className="text-xs text-default-500 inline-flex items-center gap-1">
												{/* <FileText size={14} /> */}
												Aceita somente PDF ou HTML, maximo 5MB por arquivo.
											</div>
											<Button
												type="submit"
												color="primary"
												variant="bordered"
												isLoading={isSubmitLoading}
												isDisabled={!!isNavigationLoadingTarget}
												className="font-semibold min-w-[180px] active:bg-primary-500 active:text-white"
												startContent={isEditingMode ? <Save size={16} /> : <Check size={16} />}
											>
												{isEditingMode ? "Salvar alteracoes" : "Publicar conteúdo"}
											</Button>
										</div>
									</form>
								)}
							</section>
						</div>
					</CardBody>
				</Card>
			</main>
		</>
	)
}
