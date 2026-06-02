"use client"

export const runtime = "edge"

import { Type_panelSession } from "@/app/painel/layout_context"
import {
	Type_backendContent,
	Type_backendStudentPostadoResponse
} from "@/env"
import { Component_HeaderIdChatbotContentServer } from "@/component/(path_[id-chatbot])/layout_[id-chatbot]/ui/header_[id-chatbot]/header_[id-chatbot]_content_server"
import {
	Button,
	Card,
	CardBody,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Spinner
} from "@nextui-org/react"
import { ArrowLeft, Banknote, FilePlus2, Files, FileText, PencilLine, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

const Const_studentSessionStorageKey = "somente_alunos_student_session_v1"

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

function Function_getPostedAvailabilityLabel(Parameter_content: Type_backendContent, Parameter_nowMs: number): string {
	if (!Parameter_content.prevision_content) {
		return "Disponivel em breve"
	}

	const Const_previsionMs = new Date(Parameter_content.prevision_content).getTime()
	if (Number.isNaN(Const_previsionMs)) {
		return "Disponivel em breve"
	}

	const Const_diffMs = Const_previsionMs - Parameter_nowMs
	if (Const_diffMs <= 0) {
		return "Disponivel em breve"
	}

	const Const_hoursLeft = Math.max(1, Math.ceil(Const_diffMs / (1000 * 60 * 60)))
	return `Disponivel em ${Const_hoursLeft} horas`
}

export default function Page_Postar(): JSX.Element {
	const Const_router = useRouter()
	const [isSession, setSession] = useState<Type_panelSession | null>(null)
	const [isPageLoading, setPageLoading] = useState(true)
	const [isLoadingPostedContentArray, setLoadingPostedContentArray] = useState(false)
	const [isPostedContentArray, setPostedContentArray] = useState<Type_backendContent[]>([])
	const [isPageError, setPageError] = useState("")
	const [isPageSuccess, setPageSuccess] = useState("")
	const [isNavigationLoadingTarget, setNavigationLoadingTarget] = useState("")
	const [isDeleteTargetContent, setDeleteTargetContent] = useState<Type_backendContent | null>(null)
	const [isDeleteLoading, setDeleteLoading] = useState(false)
	const [isPressedPostedCardUuid, setPressedPostedCardUuid] = useState("")

	const Function_fetchPostedContentArray = useCallback(async (): Promise<void> => {
		try {
			setLoadingPostedContentArray(true)
			setPageError("")
			setPageSuccess("")

			const Const_response = await fetch(
				`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/get/student/postado`,
				{ credentials: "include" }
			)
			if (!Const_response.ok) {
				if (Const_response.status === 451) {
					Const_router.push("/entrar")
					return
				}
				throw new Error("Falha ao carregar conteúdos postados")
			}

			const Const_responseBody = await Const_response.json() as Type_backendStudentPostadoResponse
			setPostedContentArray(Array.isArray(Const_responseBody.contentArray) ? Const_responseBody.contentArray : [])
		}
		catch {
			setPageError("Não foi possível carregar suas postagens agora.")
		}
		finally {
			setLoadingPostedContentArray(false)
		}
	}, [Const_router])

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

		Function_fetchPostedContentArray().catch(() => undefined)
	}, [isSession, Function_fetchPostedContentArray])

	const Function_navigateWithFeedback = useCallback((Parameter_route: string, Parameter_target: string): void => {
		if (isNavigationLoadingTarget) {
			return
		}

		setNavigationLoadingTarget(Parameter_target)
		Const_router.push(Parameter_route)
	}, [Const_router, isNavigationLoadingTarget])

	const Function_openDeleteModal = useCallback((Parameter_content: Type_backendContent): void => {
		if (isNavigationLoadingTarget || isDeleteLoading) {
			return
		}

		setPageError("")
		setPageSuccess("")
		setDeleteTargetContent(Parameter_content)
	}, [isNavigationLoadingTarget, isDeleteLoading])

	const Function_closeDeleteModal = useCallback((): void => {
		if (isDeleteLoading) {
			return
		}

		setDeleteTargetContent(null)
	}, [isDeleteLoading])

	const Function_confirmDeleteContent = useCallback(async (): Promise<void> => {
		if (!isDeleteTargetContent || isDeleteLoading) {
			return
		}

		try {
			setDeleteLoading(true)
			setPageError("")
			setPageSuccess("")

			const Const_response = await fetch(
				`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/delete/student/conteudo?content_uuid=${encodeURIComponent(isDeleteTargetContent.content_uuid)}`,
				{
					method: "DELETE",
					credentials: "include"
				}
			)
			if (!Const_response.ok) {
				if (Const_response.status === 451) {
					Const_router.push("/entrar")
					return
				}
				throw new Error("Falha ao excluir conteúdo")
			}

			const Const_deletedContentName = isDeleteTargetContent.name_content
			const Const_deletedContentUuid = isDeleteTargetContent.content_uuid
			setPostedContentArray((Parameter_previousArray) => {
				return Parameter_previousArray.filter((Parameter_single) => Parameter_single.content_uuid !== Const_deletedContentUuid)
			})
			setPageSuccess(`Conteúdo "${Const_deletedContentName}" excluido com sucesso.`)
			setDeleteTargetContent(null)
		}
		catch {
			setPageError("Não foi possível excluir esse conteúdo agora.")
		}
		finally {
			setDeleteLoading(false)
		}
	}, [Const_router, isDeleteLoading, isDeleteTargetContent])

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
							<div className="mb-5 flex flex-col gap-2 items-center md:flex-row md:justify-end">
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
								<Button
									color={"new-secondary" as unknown as "default"}
									variant="bordered"
									className="w-full max-w-[420px] md:w-auto font-semibold border-new-secondary text-new-secondary active:bg-new-secondary active:text-white"
									startContent={<Banknote size={18} />}
									isLoading={isNavigationLoadingTarget === "carteira"}
									isDisabled={!!isNavigationLoadingTarget}
									onClick={() => Function_navigateWithFeedback("/carteira", "carteira")}
								>
									Ver minhas Vendas
								</Button>
								<Button
									color={"new-tertiary" as unknown as "default"}
									variant="bordered"
									className="w-full max-w-[420px] md:w-auto font-semibold border-new-tertiary text-new-tertiary active:bg-new-tertiary active:text-white"
									startContent={<FilePlus2 size={18} />}
									isLoading={isNavigationLoadingTarget === "novo"}
									isDisabled={!!isNavigationLoadingTarget}
									onClick={() => Function_navigateWithFeedback("/conteudo-novo", "novo")}
								>
									Postar novo Conteúdo
								</Button>
							</div>

							{/*
								<div className="mb-6 flex flex-col">
									<h1 className="text-2xl font-semibold">Minhas postagens</h1>
									<span className="text-sm text-default-500">
										{isPostedContentArray.length} conteúdos encontrados
									</span>
								</div>

								{isPageError ? (
									<div className="mb-4 rounded-xl border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700">
										{isPageError}
									</div>
								) : null}

								{isLoadingPostedContentArray ? (
									<div className="py-14 sm:py-16 flex items-center justify-center">
										<Spinner />
									</div>
								) : isPostedContentArray.length <= 0 ? (
									<div className="py-14 sm:py-16 flex flex-col items-center justify-center gap-3 text-center">
										<div className="h-12 w-12 rounded-full bg-default-100 text-default-500 flex items-center justify-center">
											<Files size={22} />
										</div>
										<p className="text-sm sm:text-base font-medium text-default-700">
											Você não postou nenhum conteúdo ainda
										</p>
									</div>
								) : (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{isPostedContentArray.map((Let_contentSingle) => (
											<Card
												key={Let_contentSingle.content_uuid}
												isPressable
												onPress={() => {
													Function_navigateWithFeedback(
														`/conteudo-novo?content_uuid=${encodeURIComponent(Let_contentSingle.content_uuid)}`,
														`editar:${Let_contentSingle.content_uuid}`
													)
												}}
												className={`border border-default-200 ${isNavigationLoadingTarget === `editar:${Let_contentSingle.content_uuid}` ? "opacity-80" : ""}`}
											>
												<CardHeader className="flex flex-col items-start gap-1 pb-1">
													<div className="text-lg font-semibold">{Let_contentSingle.name_content}</div>
													<div className="text-xs text-default-500">
														Atualizado em {new Date(Let_contentSingle.content_update).toLocaleString("pt-BR")}
													</div>
												</CardHeader>
												<CardBody className="pt-1">
													<div className="flex items-center justify-between">
														<span className="text-sm text-default-600">Preço atual</span>
														<span className="text-lg font-bold text-success">
															R$ {Let_contentSingle.current_price_content.toFixed(2).replace(".", ",")}
														</span>
													</div>
													<div className="mt-3 flex items-center gap-3 text-xs text-default-500">
														<span className={`inline-flex items-center gap-1 ${Let_contentSingle.preview_file_uuid_content ? "text-success" : ""}`}>
															<FileText size={14} />
															{Let_contentSingle.preview_file_uuid_content ? "Preview enviado" : "Sem preview"}
														</span>
														<span className={`inline-flex items-center gap-1 ${Let_contentSingle.full_file_uuid_content ? "text-success" : ""}`}>
															<FileText size={14} />
															{Let_contentSingle.full_file_uuid_content ? "Completo enviado" : "Sem completo"}
														</span>
													</div>
												</CardBody>
												<CardFooter className="pt-0 flex items-center justify-end">
													<Button
														size="sm"
														color="secondary"
														variant="bordered"
														className="active:bg-secondary-500 active:text-white"
														startContent={<PencilLine size={14} />}
														isLoading={isNavigationLoadingTarget === `editar:${Let_contentSingle.content_uuid}`}
														isDisabled={!!isNavigationLoadingTarget}
													>
														Editar conteúdo
													</Button>
												</CardFooter>
											</Card>
										))}
									</div>
								)}
							*/}

							<div className="mb-5">
								<div className="flex items-center gap-2">
									<Files size={20} className="text-default-600" />
									<h1 className="text-2xl font-semibold">Minhas postagens</h1>
								</div>
								<div className="mt-1 text-sm text-default-600">
									<span className="font-medium">{isPostedContentArray.length} conteúdos encontrados</span>
								</div>
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

							{isLoadingPostedContentArray ? (
								<div className="py-14 sm:py-16 flex items-center justify-center">
									<Spinner />
								</div>
							) : isPostedContentArray.length <= 0 ? (
								<div className="py-14 sm:py-16 flex flex-col items-center justify-center gap-3 text-center">
									<div className="h-12 w-12 rounded-full bg-default-100 text-default-500 flex items-center justify-center">
										<Files size={22} />
									</div>
									<p className="text-sm sm:text-base font-medium text-default-700">
										Você não postou nenhum conteúdo ainda.
									</p>
								</div>
							) : (
								<div className="grid grid-cols-1 gap-4">
									{isPostedContentArray.map((Let_contentSingle) => {
										const Const_nowMs = Date.now()
										const Const_availabilityLabel = Function_getPostedAvailabilityLabel(Let_contentSingle, Const_nowMs)
										const Const_hasFullFile = !!Let_contentSingle.full_file_uuid_content
										const Const_hasPreviewOnly = !Const_hasFullFile && !!Let_contentSingle.preview_file_uuid_content
										const Const_isUnavailable = !Const_hasFullFile && !Let_contentSingle.preview_file_uuid_content
										const Const_oldPrice = Let_contentSingle.old_price_content ?? Let_contentSingle.current_price_content
										const Const_editTarget = `editar:${Let_contentSingle.content_uuid}`
										const Const_isEditingThisContent = isNavigationLoadingTarget === Const_editTarget
										const Const_isDeletingThisContent = isDeleteLoading && isDeleteTargetContent?.content_uuid === Let_contentSingle.content_uuid

										const Function_openEditPage = (): void => {
											Function_navigateWithFeedback(
												`/conteudo-novo?content_uuid=${encodeURIComponent(Let_contentSingle.content_uuid)}`,
												Const_editTarget
											)
										}

										return (
											<div
												key={Let_contentSingle.content_uuid}
												className={`rounded-xl border border-default-400 p-4 transition-colors ${Const_isEditingThisContent ? "opacity-80" : `cursor-pointer ${isPressedPostedCardUuid === Let_contentSingle.content_uuid ? "bg-default-300 border-default-500" : "bg-default-50/60"}`}`}
												role="button"
												tabIndex={0}
												onPointerDown={(Parameter_event) => {
													const Const_target = Parameter_event.target as HTMLElement | null
													if (Const_target?.closest("button")) {
														return
													}

													setPressedPostedCardUuid(Let_contentSingle.content_uuid)
												}}
												onPointerUp={() => setPressedPostedCardUuid("")}
												onPointerCancel={() => setPressedPostedCardUuid("")}
												onPointerLeave={() => setPressedPostedCardUuid("")}
												onClick={() => {
													if (isDeleteLoading || isNavigationLoadingTarget) {
														return
													}
													Function_openEditPage()
												}}
												onKeyDown={(Parameter_event) => {
													if (isDeleteLoading || isNavigationLoadingTarget) {
														return
													}
													if (Parameter_event.key === "Enter" || Parameter_event.key === " ") {
														Parameter_event.preventDefault()
														Function_openEditPage()
													}
												}}
											>
												<div className="flex items-start gap-2">
													<FileText size={20} className="mt-[1px] text-default-600" />
													<div className="text-base font-semibold text-default-900">{Let_contentSingle.name_content}</div>
												</div>
												<div className="mt-1 text-sm text-default-600">
													Atualizado em {new Date(Let_contentSingle.content_update).toLocaleString("pt-BR")}
												</div>
												<div className="mt-2 flex flex-wrap items-center gap-2">
													<span className={`inline-flex min-h-8 items-center rounded-full px-3 text-sm font-medium ${
														Let_contentSingle.verified_content === 1
															? "bg-success-100 text-success-700"
															: "bg-danger-100 text-danger-700"
													}`}>
														{Let_contentSingle.verified_content === 1
															? "Verificado"
															: "Não verificado"}
													</span>
												</div>
												{Const_hasPreviewOnly ? (
													<div className="mt-2 flex flex-wrap items-center gap-2">
														{Const_oldPrice > 0 && Const_oldPrice !== Let_contentSingle.current_price_content ? (
															<span className="inline-flex min-h-8 items-center rounded-full bg-default-100 px-3 text-sm text-default-500 line-through">
																{Function_formatCurrencyBRL(Const_oldPrice)}
															</span>
														) : null}
														<span className="inline-flex min-h-8 items-center rounded-full bg-success-100 px-3 text-sm font-semibold text-success-700">
															{Function_formatCurrencyBRL(Let_contentSingle.current_price_content)}
														</span>
													</div>
												) : Const_isUnavailable ? (
													<div className="mt-2 flex flex-wrap items-center gap-2">
														<span className="inline-flex min-h-8 items-center rounded-full px-3 text-sm font-medium bg-warning-100 text-warning-700">
															{Const_availabilityLabel}
														</span>
													</div>
												) : null}
												<div className="mt-3 flex flex-wrap gap-2">
													<Button
														size="md"
														variant="solid"
														className="min-h-11 px-4 text-base font-semibold bg-new-primary text-white active:bg-new-primary-700"
														startContent={<PencilLine size={18} />}
														isLoading={Const_isEditingThisContent}
														isDisabled={!!isNavigationLoadingTarget || isDeleteLoading}
														onClick={(Parameter_event) => {
															Parameter_event.stopPropagation()
															Function_openEditPage()
														}}
													>
														Editar conteúdo
													</Button>
													<Button
														size="md"
														variant="solid"
														className="min-h-11 px-4 text-base font-semibold bg-new-tertiary text-white active:bg-new-tertiary-700"
														startContent={<Trash2 size={18} />}
														isLoading={Const_isDeletingThisContent}
														isDisabled={!!isNavigationLoadingTarget || isDeleteLoading}
														onClick={(Parameter_event) => {
															Parameter_event.stopPropagation()
															Function_openDeleteModal(Let_contentSingle)
														}}
													>
														Excluir conteúdo
													</Button>
												</div>
											</div>
										)
									})}
								</div>
							)}
						</div>
					</CardBody>
				</Card>
			</main>

			<Modal
				isOpen={!!isDeleteTargetContent}
				placement="center"
				onOpenChange={(Parameter_isOpen) => {
					if (!Parameter_isOpen) {
						Function_closeDeleteModal()
					}
				}}
				isDismissable={!isDeleteLoading}
				isKeyboardDismissDisabled={isDeleteLoading}
				hideCloseButton
			>
				<ModalContent>
					<ModalHeader>Excluir conteúdo</ModalHeader>
					<ModalBody>
						<p className="text-sm text-default-700">
							Você quer excluir o conteúdo{" "}
							<span className="font-semibold">{isDeleteTargetContent?.name_content || ""}</span>?
						</p>
					</ModalBody>
					<ModalFooter>
						<Button
							color="default"
							variant="bordered"
							className="active:bg-default-500 active:text-white"
							isDisabled={isDeleteLoading}
							onClick={Function_closeDeleteModal}
						>
							Cancelar
						</Button>
						<Button
							color="danger"
							variant="solid"
							className="active:bg-danger-700"
							isLoading={isDeleteLoading}
							onClick={() => {
								Function_confirmDeleteContent().catch(() => {
									setPageError("Não foi possível excluir esse conteúdo agora.")
								})
							}}
						>
							Excluir agora
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	)
}
