"use client"

export const runtime = "edge"

import { Type_panelSession } from "@/app/painel/layout_context"
import { Component_HeaderIdChatbotContentServer } from "@/component/(path_[id-chatbot])/layout_[id-chatbot]/ui/header_[id-chatbot]/header_[id-chatbot]_content_server"
import { Button, Card, CardBody, Spinner } from "@nextui-org/react"
import { ArrowLeft, Banknote, CheckCircle2, Clock3, FilePlus2, FileText, LibraryBig, Wallet } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"

const Const_studentSessionStorageKey = "somente_alunos_student_session_v1"

type Type_walletSaleInformation = {
	name_content?: string;
}

type Type_walletSale = {
	saleHistoryUuid: string;
	saleHistoryCreated: string;
	studentUuidBuyerSaleHistory: string;
	statusSaleHistory: string;
	paidToSellerSaleHistory: string | null;
	informationContentSaleHistory: Type_walletSaleInformation | null;
	amountSaleHistory: number;
}

type Type_walletResponse = {
	soldArray?: Type_walletSale[];
	pendingAmount?: number;
	receivedAmount?: number;
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

export default function Page_Carteira(): JSX.Element {
	const Const_router = useRouter()
	const [isSession, setSession] = useState<Type_panelSession | null>(null)
	const [isPageLoading, setPageLoading] = useState(true)
	const [isWalletLoading, setWalletLoading] = useState(false)
	const [isNavigationLoadingTarget, setNavigationLoadingTarget] = useState("")
	const [isPageError, setPageError] = useState("")

	const [isSoldArray, setSoldArray] = useState<Type_walletSale[]>([])
	const [isPendingAmount, setPendingAmount] = useState(0)
	const [isReceivedAmount, setReceivedAmount] = useState(0)

	const isTotalSoldAmount = useMemo(() => {
		return Number((isPendingAmount + isReceivedAmount).toFixed(2))
	}, [isPendingAmount, isReceivedAmount])

	const Function_fetchWallet = useCallback(async (): Promise<void> => {
		try {
			setWalletLoading(true)
			setPageError("")

			const Const_response = await fetch(`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/get/student/carteira`, {
				credentials: "include"
			})
			if (!Const_response.ok) {
				if (Const_response.status === 451) {
					Const_router.push("/entrar")
					return
				}

				throw new Error("Falha ao carregar carteira")
			}

			const Const_responseBody = await Const_response.json() as Type_walletResponse
			setSoldArray(Array.isArray(Const_responseBody.soldArray) ? Const_responseBody.soldArray : [])
			setPendingAmount(typeof Const_responseBody.pendingAmount === "number" ? Const_responseBody.pendingAmount : 0)
			setReceivedAmount(typeof Const_responseBody.receivedAmount === "number" ? Const_responseBody.receivedAmount : 0)
		}
		catch {
			setPageError("Nao foi possivel carregar sua carteira agora.")
		}
		finally {
			setWalletLoading(false)
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

		Function_fetchWallet().catch(() => undefined)
	}, [isSession, Function_fetchWallet])

	const Function_navigateWithFeedback = useCallback((Parameter_route: string, Parameter_target: string): void => {
		if (isNavigationLoadingTarget) {
			return
		}

		setNavigationLoadingTarget(Parameter_target)
		Const_router.push(Parameter_route)
	}, [Const_router, isNavigationLoadingTarget])

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

			<main className="flex justify-center pt-[15px] px-[10px] mt-[74px]">
				<Card className="flex w-[1200px] px-3 pt-2 md:pt-0 pb-3 p-0 border-small border-default-200 shadow-none border-none">
					<CardBody className="pt-0 overflow-hidden !px-[0px] md:!px-[40px]">
						<div className="w-full max-w-[980px] mx-auto pb-10 pt-3">
							<div className="mb-5 flex flex-col gap-2 items-end md:flex-row md:justify-end">
								<Button
									color="default"
									variant="bordered"
									className="w-full max-w-[420px] md:w-auto font-semibold border-default-400 bg-default-100 text-default-900 active:bg-default-500 active:text-white"
									startContent={<ArrowLeft size={18} />}
									isLoading={isNavigationLoadingTarget === "postar"}
									isDisabled={!!isNavigationLoadingTarget}
									onClick={() => Function_navigateWithFeedback("/postar", "postar")}
								>
									Voltar para Minhas Postagens
								</Button>
							</div>

							<div className="mb-5">
								<div className="flex items-center gap-2">
									<Wallet size={20} className="text-default-600" />
									<h1 className="text-2xl font-semibold">Carteira</h1>
								</div>
								<div className="mt-1 text-sm text-default-600">
									Acompanhe suas vendas e o repasse dos valores.
								</div>
							</div>
							<div className="mb-4 rounded-xl border border-default-300 bg-default-50 p-3 text-sm text-default-700">
								Ficamos com 3% do valor de cada transacao para fins de manutenção. O valor da compra e liberado para voce apos 7 dias, para dar tempo do cliente pedir reembolso caso queira.
							</div>

							{isPageError ? (
								<div className="mb-4 rounded-xl border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700">
									{isPageError}
								</div>
							) : null}

							<div className="mb-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
								<div className="rounded-xl border border-default-300 bg-default-50 p-4">
									<div className="text-sm text-default-600">Valor pendente</div>
									<div className="mt-1 text-xl font-semibold text-warning-700">
										{Function_formatCurrencyBRL(isPendingAmount)}
									</div>
								</div>
								<div className="rounded-xl border border-default-300 bg-default-50 p-4">
									<div className="text-sm text-default-600">Valor recebido</div>
									<div className="mt-1 text-xl font-semibold text-success-700">
										{Function_formatCurrencyBRL(isReceivedAmount)}
									</div>
								</div>
								<div className="rounded-xl border border-default-300 bg-default-50 p-4">
									<div className="text-sm text-default-600">Total vendido</div>
									<div className="mt-1 text-xl font-semibold text-default-900">
										{Function_formatCurrencyBRL(isTotalSoldAmount)}
									</div>
								</div>
							</div>

							{isWalletLoading ? (
								<div className="py-14 sm:py-16 flex items-center justify-center">
									<Spinner />
								</div>
							) : isSoldArray.length <= 0 ? (
								<div className="py-14 sm:py-16 flex flex-col items-center justify-center gap-3 text-center">
									<div className="h-12 w-12 rounded-full bg-default-100 text-default-500 flex items-center justify-center">
										<Banknote size={22} />
									</div>
									<p className="text-sm sm:text-base font-medium text-default-700">
										Voce ainda nao tem vendas na carteira.
									</p>
								</div>
							) : (
								<div className="grid grid-cols-1 gap-4">
									{isSoldArray.map((Let_saleSingle) => {
										const Const_contentName = Let_saleSingle.informationContentSaleHistory?.name_content || "Conteudo sem nome"
										const Const_isCompletedSale = Let_saleSingle.statusSaleHistory === "completed"
										return (
											<div
												key={Let_saleSingle.saleHistoryUuid}
												className="rounded-xl border border-default-400 p-4 bg-default-50/60"
											>
												<div className="flex items-start gap-2">
													<FileText size={20} className="mt-[1px] text-default-600" />
													<div className="text-base font-semibold text-default-900">{Const_contentName}</div>
												</div>
												<div className="mt-1 text-sm text-default-600">
													Comprado por {Function_getStudentAlias(Let_saleSingle.studentUuidBuyerSaleHistory)}
												</div>
												<div className="mt-2 text-xs text-default-500">
													Venda em {new Date(Let_saleSingle.saleHistoryCreated).toLocaleString("pt-BR")}
												</div>

												<div className="mt-3 flex flex-wrap gap-2">
													<span className="inline-flex min-h-8 items-center rounded-full bg-success-100 px-3 text-sm font-semibold text-success-700">
														{Function_formatCurrencyBRL(Let_saleSingle.amountSaleHistory)}
													</span>
													<span className={`inline-flex min-h-8 items-center rounded-full px-3 text-sm font-medium ${
														Const_isCompletedSale ? "bg-success-100 text-success-700" : "bg-default-200 text-default-700"
													}`}>
														{Const_isCompletedSale ? "Venda concluida" : "Venda em analise"}
													</span>
													<span className={`inline-flex min-h-8 items-center gap-1 rounded-full px-3 text-sm font-medium ${
														Let_saleSingle.paidToSellerSaleHistory ? "bg-success-100 text-success-700" : "bg-warning-100 text-warning-700"
													}`}>
														{Let_saleSingle.paidToSellerSaleHistory ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}
														{Let_saleSingle.paidToSellerSaleHistory ? "Repasse efetuado" : "Repasse pendente"}
													</span>
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
		</>
	)
}
