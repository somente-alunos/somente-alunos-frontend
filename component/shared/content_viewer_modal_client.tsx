"use client"

import {
	Button,
	Checkbox,
	Modal,
	ModalBody,
	ModalContent,
	ModalHeader,
	Spinner
} from "@nextui-org/react"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { useCallback, useMemo, useState, type ReactNode, type RefObject } from "react"

type Type_contentViewerModalClientProps = {
	isOpen: boolean;
	onClose: () => void;
	ownerAlias: string;
	isLoading: boolean;
	fileUrl: string;
	isHtmlFile: boolean;
	iframeRef: RefObject<HTMLIFrameElement | null>;
	onIframeLoad: () => void;
	iframeHeightPx: number;
	errorMessage: string;
	reportContentUuid?: string | null;
	topActions?: ReactNode;
	floatingAction?: ReactNode;
	warningContent?: ReactNode;
}

const Const_reportReasonOptionArray = [
	"Nudez ou violencia",
	"Discurso de odio ou ofensivo",
	"Conteudo incorreto ou enganoso",
	"Violacao de direitos autorais",
	"Outros"
] as const

const Const_defaultWarningContent = (
	<>
		<strong>Aviso:</strong> Voce tem direito ao reembolso caso o conteudo entregue nao seja o prometido, basta entrar em contato com o{" "}
		<Link href="/suporte" className="underline font-semibold">
			suporte
		</Link>
		, queremos criar uma comunidade saudavel.
	</>
)

export function Component_ContentViewerModalClient(
	Parameter_props: Type_contentViewerModalClientProps
): JSX.Element {
	const [isReportModalOpen, setReportModalOpen] = useState(false)
	const [isReportReasonArray, setReportReasonArray] = useState<Array<string>>([])
	const [isReportExtraInformation, setReportExtraInformation] = useState("")
	const [isReportStatus, setReportStatus] = useState<"idle" | "loading" | "success">("idle")
	const [isReportError, setReportError] = useState("")

	const Const_warningContent = Parameter_props.warningContent || Const_defaultWarningContent
	const Const_hasContentUuidToReport = typeof Parameter_props.reportContentUuid === "string" && Parameter_props.reportContentUuid.trim().length > 0
	const Const_reportCanSubmit = isReportReasonArray.length > 0 && isReportStatus !== "loading"

	const Const_reportReasonSet = useMemo(() => {
		return new Set(isReportReasonArray)
	}, [isReportReasonArray])

	const Function_handleOpenReportModal = useCallback((): void => {
		setReportStatus("idle")
		setReportError("")
		setReportModalOpen(true)
	}, [])

	const Function_handleToggleReportReason = useCallback((Parameter_reason: string): void => {
		setReportReasonArray((Parameter_previous) => {
			if (Parameter_previous.includes(Parameter_reason)) {
				return Parameter_previous.filter((Parameter_single) => Parameter_single !== Parameter_reason)
			}

			return [...Parameter_previous, Parameter_reason]
		})
	}, [])

	const Function_handleSubmitReport = useCallback(async (): Promise<void> => {
		if (isReportStatus === "loading") {
			return
		}
		if (!Const_hasContentUuidToReport) {
			setReportError("Nao foi possivel identificar o conteudo para denunciar.")
			return
		}
		if (isReportReasonArray.length <= 0) {
			setReportError("Selecione ao menos um motivo para enviar a denuncia.")
			return
		}

		setReportStatus("loading")
		setReportError("")

		try {
			const Const_backendBaseUrl = process.env.NEXT_PUBLIC_Env_urlApiBackend || ""
			const Const_endpoint = Const_backendBaseUrl
				? `${Const_backendBaseUrl.replace(/\/+$/, "")}/post/student/denuncia`
				: "/post/student/denuncia"

			const Const_extraInformationTrimmed = isReportExtraInformation.trim()
			const Const_body = {
				content_uuid_denuncia: Parameter_props.reportContentUuid,
				reason_array_denuncia: isReportReasonArray,
				extra_information_denuncia: Const_extraInformationTrimmed.length > 0 ? Const_extraInformationTrimmed : undefined
			}

			const Const_response = await fetch(Const_endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				credentials: "include",
				body: JSON.stringify(Const_body)
			})

			if (!Const_response.ok) {
				let Let_errorMessage = "Nao foi possivel enviar a denuncia no momento."
				try {
					const Const_responseBodyUnknown = await Const_response.json() as { error?: unknown }
					if (typeof Const_responseBodyUnknown?.error === "string" && Const_responseBodyUnknown.error.trim().length > 0) {
						Let_errorMessage = Const_responseBodyUnknown.error
					}
				}
				catch {
					// Mantem mensagem padrao.
				}

				setReportStatus("idle")
				setReportError(Let_errorMessage)
				return
			}

			setReportStatus("success")
			setReportReasonArray([])
			setReportExtraInformation("")
		}
		catch {
			setReportStatus("idle")
			setReportError("Nao foi possivel enviar a denuncia no momento. Tente novamente em alguns instantes.")
		}
	}, [Const_hasContentUuidToReport, isReportExtraInformation, isReportReasonArray, isReportStatus, Parameter_props.reportContentUuid])

	return (
		<>
			<Modal
				isOpen={Parameter_props.isOpen}
				placement="center"
				classNames={{ closeButton: "hidden" }}
				motionProps={{
					variants: {
						enter: {
							y: 0,
							opacity: 1,
							transition: {
								duration: 0.3,
								ease: "easeOut"
							}
						},
						exit: {
							y: -800,
							opacity: 0,
							transition: {
								duration: 0.2,
								ease: "easeIn"
							}
						}
					}
				}}
				onOpenChange={(Parameter_isOpen) => {
					if (!Parameter_isOpen) {
						Parameter_props.onClose()
					}
				}}
			>
				<ModalContent className="!m-0 w-[900px] max-w-full rounded-none md:rounded-[12px] max-h-[100svh] md:max-h-[calc(100svh-20px)] overflow-y-auto md:!mx-[15px]">
					<ModalHeader className="flex flex-col gap-3 px-4 md:px-5 pb-3 pt-4">
						<h1 className="font-light tracking-[0.5px] text-[22px] leading-tight flex flex-wrap">
							Compartilhada por&nbsp;
							<span className="font-normal break-all">{Parameter_props.ownerAlias}</span>
						</h1>

						<div className="flex items-start gap-2.5 bg-warning-50 border-l-4 border-warning-400 px-3 py-2 rounded">
							<AlertCircle size={17} className="text-warning-700 mt-0.5 shrink-0" />
							<div className="text-sm text-warning-800 leading-relaxed">{Const_warningContent}</div>
						</div>

						<div className="flex items-start justify-between gap-2 flex-wrap">
							<button
								type="button"
								onClick={Function_handleOpenReportModal}
								disabled={!Const_hasContentUuidToReport || Parameter_props.isLoading}
								className="mt-1 text-[11px] md:text-[12px] font-normal tracking-[0.1px] text-rose-800 underline underline-offset-2 decoration-rose-800/80 active:text-rose-900 disabled:text-rose-300 disabled:decoration-rose-300"
							>
								Denunciar esse conteúdo
							</button>

							<div className="flex gap-2 ml-auto items-center flex-wrap justify-end">
								{Parameter_props.topActions || null}
								<Button
									onClick={Parameter_props.onClose}
									variant="bordered"
									className="tracking-[0.5px] text-[16px] font-semibold border-default-400 text-default-800 active:bg-default-500 active:text-white"
								>
									Voltar
								</Button>
							</div>
						</div>
					</ModalHeader>

					<ModalBody className="px-4 md:px-5 pb-4 md:pb-5 pt-0">
						<div
							className="w-full shadow-medium rounded-[6px] border border-black overflow-hidden flex flex-col items-center min-h-[68svh] md:min-h-[74svh]"
						>
							{Parameter_props.isLoading ? (
								<div className="w-full min-h-[68svh] md:min-h-[74svh] flex flex-col items-center justify-center">
									<Spinner
										label="Buscando..."
										color="primary"
										classNames={{
											wrapper: "w-[70px] h-[70px]",
											circle1: "border-[6px]",
											circle2: "border-[6px]",
											label: "text-[20px] mt-[8px] tracking-[1px]"
										}}
									/>
								</div>
							) : Parameter_props.fileUrl ? (
								<iframe
									ref={Parameter_props.iframeRef as RefObject<HTMLIFrameElement>}
									src={Parameter_props.fileUrl}
									title="Visualizador de conteudo"
									onLoad={Parameter_props.onIframeLoad}
									className={Parameter_props.isHtmlFile
										? "!m-0 !p-0 w-full border-0 bg-transparent pointer-events-none"
										: "!m-0 !p-0 w-full h-[68svh] md:h-[74svh] border-0 bg-transparent"}
									style={Parameter_props.isHtmlFile
										? { height: `${Math.max(720, Parameter_props.iframeHeightPx)}px` }
										: undefined}
								/>
							) : (
								<div className="w-full min-h-[68svh] md:min-h-[74svh] flex items-center justify-center text-default-600 text-base px-4 text-center">
									Arquivo indisponivel no momento.
								</div>
							)}

							{Parameter_props.floatingAction || null}

							{Parameter_props.errorMessage ? (
								<div className="w-full border-t border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
									{Parameter_props.errorMessage}
								</div>
							) : null}
						</div>
					</ModalBody>
				</ModalContent>
			</Modal>

			<Modal
				isOpen={isReportModalOpen}
				onOpenChange={setReportModalOpen}
				placement="center"
				backdrop="blur"
				size="lg"
				hideCloseButton
				isDismissable={false}
				isKeyboardDismissDisabled
			>
				<ModalContent className="rounded-xl max-h-[calc(100svh-24px)] overflow-hidden">
					<ModalHeader className="flex flex-col gap-1 pb-1">
						<h2 className="text-lg font-semibold">Denunciar conteudo</h2>
					</ModalHeader>

					<ModalBody className="gap-3 pb-4 overflow-y-auto">
						{isReportStatus === "loading" ? (
							<div className="min-h-[220px] flex flex-col items-center justify-center gap-3 text-center">
								<Spinner
									color="danger"
									classNames={{
										wrapper: "w-[52px] h-[52px]",
										circle1: "border-[5px]",
										circle2: "border-[5px]"
									}}
								/>
							</div>
						) : isReportStatus === "success" ? (
							<div className="rounded-lg border border-success-200 bg-success-50 px-4 py-4 text-sm text-success-800 leading-relaxed">
								Denuncia enviada com sucesso. Um administrador vai revisar o conteudo e, se for confirmado que é nocivo, o conteudo sera removido e o autor sera banido.
								
								<div className="mt-3">
										<strong>Obrigado por ajudar a manter a comunidade segura e saudavel!</strong>
								</div>
								
								<div className="mt-3">
									Precisa de ajuda agora?{" "}
									<Link href="/suporte" className="font-semibold underline">
										Fale com o suporte
									</Link>
									.
								</div>
							</div>
						) : (
							<>
								<div className="rounded-md border border-warning-200 bg-warning-50 px-3 py-2 text-xs text-warning-800">
									Se precisar, voce tambem pode{" "}
									<Link href="/suporte" className="font-semibold underline">
										falar com o suporte
									</Link>
									.
								</div>

								<div className="max-h-[220px] overflow-y-auto pr-1 space-y-1.5">
									{Const_reportReasonOptionArray.map((Parameter_reason) => (
										<label
											key={Parameter_reason}
											className="flex items-center gap-2 rounded-md border border-default-200 px-2.5 py-2 active:bg-default-100"
										>
											<Checkbox
												isSelected={Const_reportReasonSet.has(Parameter_reason)}
												onValueChange={() => Function_handleToggleReportReason(Parameter_reason)}
												classNames={{ wrapper: "before:rounded-[5px]" }}
											/>
											<span className="text-sm text-default-800 leading-tight">{Parameter_reason}</span>
										</label>
									))}
								</div>

								<label className="grid gap-1">
									<span className="text-sm font-medium text-default-700">
										Informacoes adicionais (opcional)
									</span>
									<textarea
										value={isReportExtraInformation}
										onChange={(Parameter_event) => setReportExtraInformation(Parameter_event.target.value)}
										rows={3}
										maxLength={4000}
										placeholder="Descreva detalhes que possam ajudar na analise."
										className="w-full rounded-lg border border-default-300 bg-white px-3 py-2 text-sm outline-none focus:border-danger-400"
									/>
								</label>

								{isReportError ? (
									<div className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700">
										{isReportError}
									</div>
								) : null}
							</>
						)}

						<div className="flex justify-between gap-2 pt-1">
							<Button
								variant="bordered"
								onClick={() => setReportModalOpen(false)}
								className="font-bold border-default-400 text-default-800 active:bg-default-500 active:text-white"
							>
								Voltar
							</Button>

							{isReportStatus !== "success" ? (
								<Button
									onClick={() => {
										Function_handleSubmitReport().catch(() => {
											setReportStatus("idle")
											setReportError("Nao foi possivel enviar a denuncia no momento.")
										})
									}}
									isDisabled={!Const_reportCanSubmit}
									isLoading={isReportStatus === "loading"}
									className="font-bold bg-[#dc2626] text-white active:!bg-[#b91c1c] disabled:bg-default-300 disabled:text-default-600"
								>
									Enviar
								</Button>
							) : null}
						</div>
					</ModalBody>
				</ModalContent>
			</Modal>
		</>
	)
}
